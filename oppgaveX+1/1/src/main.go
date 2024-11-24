package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/tidwall/gjson"
)

type normalizedLog struct {
	timestamp        string
	src_ip           string
	dst_ip           string
	src_port         string
	dst_port         string
	protocol         string
	sourceType       string
	sourceFile       string
	sourceLineNumber int
}

type source struct {
	sourceFile string
	sourceType string
}

// normalize the logs
func main() {
	fmt.Println("starting normalizing")

	logFiles := []source{
		{
			sourceFile: "./../logs/tcpdump.log",
			sourceType: "tcpdump",
		},
		{
			sourceFile: "./../logs/corelight.log",
			sourceType: "Corelight",
		},
		{
			sourceFile: "./../logs/azure_nsg_flows.log",
			sourceType: "azure_nsg",
		},
	}

	for _, logFile := range logFiles {
		parseLogFile(logFile)
	}
}

func parseLogFile(sourceLog source) {

	file, err := os.Open(sourceLog.sourceFile)

	if err != nil {
		fmt.Println("could not open file", sourceLog.sourceFile, err)
		return
	}

	scanner := bufio.NewScanner(file)

	var normalizedLogs []normalizedLog

	lineNumber := 1

	for scanner.Scan() {

		var normalizedLines []normalizedLog

		switch sourceLog.sourceType {
		case "tcpdump":
			normalizedLines = parseTcpDumpLine(scanner.Text())
		case "azure_nsg":
			normalizedLines = parseAzureFlowLine(scanner.Text())
		case "Corelight":
			normalizedLines = parseCorelightLine(scanner.Text())
		}

		for i := range normalizedLines {
			normalizedLines[i].sourceFile = sourceLog.sourceFile
			normalizedLines[i].sourceType = sourceLog.sourceType
			normalizedLines[i].sourceLineNumber = lineNumber
		}

		normalizedLogs = append(normalizedLogs, normalizedLines...)

		lineNumber++
	}

	if err := scanner.Err(); err != nil {
		log.Fatal("could not parse file")
	}

	fmt.Println("result for", sourceLog.sourceFile)
	fmt.Println(len(normalizedLogs))
	fmt.Println(normalizedLogs)
}

// parses a line of a tcpdump logs
// https://www.tcpdump.org/
func parseTcpDumpLine(line string) []normalizedLog {

	var normalizedLines []normalizedLog

	var normalizedLine normalizedLog

	//handle blankLines
	if len(strings.TrimSpace(line)) == 0 {
		return []normalizedLog{}
	}

	//first 26 characters is always the timestamp
	timeStamp := []byte(line)[:26]
	normalizedLine.timestamp = string(timeStamp)

	lineSplit := strings.Split(line, " ")

	//we are only interested in the logs for IP protocol
	// if the log is not for this, we return an empty array
	if len(lineSplit) > 3 && lineSplit[2] != "IP" {
		return []normalizedLog{}
	}

	normalizedLine.protocol = "IP"

	// the ips are on the form
	// therefore these variables should be of length 5
	sourceIpAndPort := strings.Split(lineSplit[3], ".")
	destIpAndPort := strings.Split(lineSplit[5], ".")

	normalizedLine.src_ip = strings.Join(sourceIpAndPort[:4], ".")
	normalizedLine.dst_ip = strings.Join(destIpAndPort[:4], ".")

	if len(sourceIpAndPort) > 4 {
		normalizedLine.src_port = sourceIpAndPort[4]
	}
	if len(destIpAndPort) > 4 {
		//destination ports have a colon at the end which we remove
		normalizedLine.src_port = string([]byte(destIpAndPort[4])[:len(destIpAndPort[4])-1])
	}

	fmt.Println(normalizedLine.src_port)

	normalizedLines = append(normalizedLines, normalizedLine)

	return normalizedLines
}

// parses a line of a azure flow log
// https://github.com/corelight/zeek-cheatsheets/blob/master/Corelight-Zeek-Cheatsheets-3.0.4.pdf
func parseAzureFlowLine(line string) []normalizedLog {

	var normalizedLines []normalizedLog

	lineJson := gjson.Parse(line)

	// the info we are interested in is deeply nested
	// may be a better way of doing this using "#" notation
	for _, record := range lineJson.Get("records").Array() {
		ruleFlows := record.Get("properties.flows").Array()
		for _, ruleFlow := range ruleFlows {
			flows := ruleFlow.Get("flows").Array()
			for _, flow := range flows {
				flowTuples := flow.Get("flowTuples").Array()
				for _, tuple := range flowTuples {
					//this is the info we are after
					normalizedLines = append(normalizedLines, getAzureNsgTupleInfo(tuple.String()))
				}
			}
		}
	}

	return normalizedLines
}

// extracts the info we want from a nsg flow tuple
// the schema can be found here: https://learn.microsoft.com/en-us/azure/network-watcher/nsg-flow-logs-overview#log-tuple-and-bandwidth-calculation
func getAzureNsgTupleInfo(tuple string) normalizedLog {

	var normalizedTuple normalizedLog

	fields := strings.Split(tuple, ",")

	normalizedTuple.timestamp = fields[0]
	normalizedTuple.src_ip = fields[1]
	normalizedTuple.dst_ip = fields[2]
	normalizedTuple.src_port = fields[3]
	normalizedTuple.dst_port = fields[4]

	//todo normalize the protocol field
	normalizedTuple.protocol = fields[5]

	return normalizedTuple
}

// parses a line of a corelight log
// https://learn.microsoft.com/en-us/azure/network-watcher/nsg-flow-logs-overview
func parseCorelightLine(line string) []normalizedLog {

	var normalizedLines []normalizedLog

	lineJson := gjson.Parse(line)

	var normalizedLine normalizedLog

	normalizedLine.timestamp = lineJson.Get("tp").String()
	normalizedLine.src_ip = lineJson.Get(`id\.orig_h`).String()
	normalizedLine.dst_ip = lineJson.Get(`id\.resp_h`).String()
	normalizedLine.src_port = lineJson.Get(`id\.orig_p`).String()
	normalizedLine.dst_port = lineJson.Get(`id\.resp_p`).String()
	normalizedLine.protocol = lineJson.Get("proto").String()

	normalizedLines = append(normalizedLines, normalizedLine)

	return normalizedLines
}

// given a specific log, return the original line from the original file
func getOriginalLogLine(log normalizedLog) (file string, line int) {
	return log.sourceFile, log.sourceLineNumber
}
