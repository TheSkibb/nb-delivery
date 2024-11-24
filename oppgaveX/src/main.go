package main

import (
	"bufio"
	"bytes"
	"encoding/gob"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/tidwall/gjson"
)

// url endpoints

const urlBatchReq = "https://api.osv.dev/v1/querybatch" //https://google.github.io/osv.dev/post-v1-querybatch/
const urlVulnId = "https://api.osv.dev/v1/vulns/"       //https://google.github.io/osv.dev/get-v1-vulns/

// files

// const packageFile = "./Packages" //The package file to read from
const packageFile = "./Packages_short" //The package file to read from

// misc config

const environment = "Debian:12" //The environment to scan for
const batchSize = 1000          // how many packages to request at the same time

type PackageAndVersion struct {
	PackageNameAndEnv PackageNameAndEcosystem `json:"package"`
	Version           string                  `json:"version"`
}

type PackageNameAndEcosystem struct {
	PackageName string `json:"name"`
	Ecosystem   string `json:"ecosystem"`
}

type Vulnerability struct {
	//OriginPackage PackageAndVersion //currently not implemented
	PackageName string
	Version     string
	Id          string
	Summary     string
	Details     string
	Severity    []Severity
}

type BatchQuery struct {
	Queries []PackageAndVersion `json:"queries"`
}

type Severity struct {
	Type  string
	Score string
}

func main() {

	sFlag := flag.Bool("s", false, "scan for vulnerabilities")
	lFlag := flag.Bool("l", false, "load vulnerabilities from saved file")

	flag.Parse()

	var vulnerabilities []Vulnerability

	if *sFlag {
		vulnerabilities = scan()
	} else if *lFlag {
		vulnerabilities = loadVulnerabilitesFromGob()
	} else {
		fmt.Println("you need to specify an option, use -h for help")
	}

	displayDetails(vulnerabilities)
}

func scan() []Vulnerability {
	fmt.Println("starting scan")

	packagesAndVersions := getPackageList()

	vuln_ids := getVulnerabilities(packagesAndVersions)

	fmt.Println("found", len(vuln_ids), "vulnerabilites from scanning ", len(packagesAndVersions), "packages")
	fmt.Println("Now getting details:")

	vulnerabilities := fillVulnerabilityData(vuln_ids)
	_ = vulnerabilities

	fmt.Println("getting details done")

	saveVulnerabilitiesAsGob(vulnerabilities)

	return vulnerabilities
}

// loads vulnerabilities from a saved scan
func loadVulnerabilitesFromGob() []Vulnerability {
	file, err := os.Open(".saved_scan")

	defer file.Close()

	if err != nil {
		log.Fatal("could not open saved scan", err)
	}

	var vulnerabilities []Vulnerability

	decoder := gob.NewDecoder(file)
	err = decoder.Decode(&vulnerabilities)

	if err != nil {
		log.Fatal("could not decode saved scan", err)
	}

	return vulnerabilities
}

func saveVulnerabilitiesAsGob(data []Vulnerability) {
	file, err := os.Create(".saved_scan")

	defer file.Close()

	if err != nil {
		fmt.Println("error creating file, could not save result of scan", err)
	}

	encoder := gob.NewEncoder(file)
	err = encoder.Encode(data)

	if err != nil {
		fmt.Println("error encoding data, could not save result of scan", err)
	}
}

// parses the packageFile.
// extracts package names and version numbers
func getPackageList() []PackageAndVersion {
	file, err := os.Open(packageFile)

	if err != nil {
		log.Fatal("could not open file", err)
	}

	defer file.Close()

	var packagesAndVersions []PackageAndVersion

	// cant use scanner, because some lines are too long :'(
	reader := bufio.NewReader(file)

	for {
		line, _, err := reader.ReadLine()

		if err != nil {
			if err == io.EOF {
				break
			}
			log.Fatal("error reading line", err)
		}

		// if we find a package name we create a new enry in the list
		if pName := checkLine("Package: ", line); pName != "" {
			pformat := PackageNameAndEcosystem{
				PackageName: pName,
				Ecosystem:   environment,
			}
			packagesAndVersions = append(packagesAndVersions, PackageAndVersion{
				PackageNameAndEnv: pformat,
				Version:           "",
			})
		}

		//TODO, check version for last entry
		// if we find a version number we put it on the last entry in the list
		if version := checkLine("Version: ", line); version != "" {
			lastEntryIndex := len(packagesAndVersions) - 1

			// if the entry before the in the list doesnt have a version number the list is probably malformed
			if lastEntryIndex != 0 && packagesAndVersions[lastEntryIndex-1].Version == "" {
				log.Fatal("package names and version numbers do not match, package list may be malformed")
			}

			packagesAndVersions[lastEntryIndex].Version = version
		}
	}

	return packagesAndVersions
}

// checks if the line starts with the field value
// returns the corresponding attributes if it does
// return an empty string if it doesnt
func checkLine(field string, line []byte) string {
	if len(line) < len(field) {
		return ""
	}

	// checks if the line starts with the input variable
	if string(line[:len(field)]) == field {
		return string(line[len(field):])
	}

	return ""
}

// gets the vulnerability id for the packages in the list
// returns a list of vulnerabilities with only the ids filled in
func getVulnerabilities(packagesAndVersions []PackageAndVersion) []string {
	// build batch requests

	var vulnIds []string

	ch := make(chan []byte)
	var wg sync.WaitGroup

	//build batch requests of <batchSize> packages and send them
	for i := 0; i < len(packagesAndVersions); i += batchSize {
		wg.Add(1)

		batchQuery := BatchQuery{}

		for j := i; j < i+batchSize; j++ {
			if j >= len(packagesAndVersions) {
				break
			}

			batchQuery.Queries = append(batchQuery.Queries, packagesAndVersions[j])
		}
		queryData, err := json.Marshal(batchQuery)

		if err != nil {
			log.Fatal("error converting struct to json", err)
		}

		go POSTBatchRequest(queryData, ch, &wg)
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	for result := range ch {
		vulnIds = append(vulnIds, getVulnIds(result)...)
	}

	return vulnIds
}

// Posts a batch request for vulnerabilities
func POSTBatchRequest(queryData []byte, ch chan<- []byte, wg *sync.WaitGroup) []byte {

	defer wg.Done()

	resp, err := http.Post(urlBatchReq, "application/json", bytes.NewBuffer(queryData))

	if err != nil {
		log.Fatal("error sending request")
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		log.Fatal("error reading body")
	}

	ch <- body

	return body

}

// takes in the result of a batch post request
// returns the vulnerability ids as a list
func getVulnIds(data []byte) []string {

	var vulnerabilities []string

	results := gjson.Get(string(data), "results").Array()

	for _, result := range results {
		if result.String() == "{}" {
			continue
		}
		vulns := result.Get("vulns").Array()

		for _, vuln := range vulns {
			vulnerabilities = append(vulnerabilities, vuln.Get("id").String())
		}
	}

	return vulnerabilities
}

// sends a get request for
// valid id types can be found here: https://ossf.github.io/osv-schema/#id-modified-fields
func GETVulnerabilityById(id string, ch chan<- []byte, wg *sync.WaitGroup) []byte {

	defer wg.Done()

	resp, err := http.Get(urlVulnId + id)

	if err != nil {
		// TODO recover from this error
		log.Fatal("error sending request")
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		// TODO recover from this error
		log.Fatal("error reading body")
	}

	ch <- body

	return body
}

func fillVulnerabilityData(vulnIds []string) []Vulnerability {

	var vulnerabilities []Vulnerability

	ch := make(chan []byte)
	var wg sync.WaitGroup

	for i := range vulnIds {
		wg.Add(1)

		vulnId := vulnIds[i]

		go GETVulnerabilityById(vulnId, ch, &wg)
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	for vuln_info := range ch {
		vulnerabilities = append(vulnerabilities, extractVulnerabilityData(vuln_info, vulnIds))
	}

	return vulnerabilities
}

// extracts the data we are interested in, and modifies the vulnerabilities list to contain the details
// schema for response object (data) can be found here: https://ossf.github.io/osv-schema/
func extractVulnerabilityData(data []byte, vulnIds []string) Vulnerability {
	jsonString := string(data)

	var severities []Severity

	for _, severity := range gjson.Get(jsonString, "severity").Array() {
		severities = append(severities, Severity{
			Type:  severity.Get("type").String(),
			Score: severity.Get("score").String(),
		})
	}

	vulnerability := Vulnerability{
		Id:       gjson.Get(jsonString, "id").String(),
		Details:  gjson.Get(jsonString, "details").String(),
		Summary:  gjson.Get(jsonString, "summary").String(),
		Severity: severities,
	}

	return vulnerability
}

func displayDetails(vulnerabilities []Vulnerability) {
	outputStr := ""

	for _, vulnerability := range vulnerabilities {
		outputStr += "ID: " + vulnerability.Id + "\n"
		for _, severity := range vulnerability.Severity {
			outputStr += "score: \n"
			outputStr += "type: " + severity.Type + "\n"
			outputStr += "vector: " + severity.Score + "\n"
		}
		outputStr += "---------------\n\n"
	}

	fmt.Println(outputStr)
}
