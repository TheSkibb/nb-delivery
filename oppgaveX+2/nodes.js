// I denne filen finner du all logikken for defineringen av noder
//

var nodes

class Node {
    constructor (
        Navn,   // string, "", "S", eller "R"

        UnikID, // heltall mellom 0 og 10 000

        Naboer, //sortert array (eller tomt) med unikIDer, max en nabo av typen "R" eller "S" ( => ingen av typen "")
        // "R" eller "S" noder kan ha opptil 256 naboer (av hvilken som helst type)

        Samlepost, //streng // ""-nodene har en RFC1918 IP-adresse med subnet mask /32
        // "S"-nodene bør ha en tallverdi fra og med "2" til og med "4096"
        // "R"-nodene inneholder en gyldig RFC1918 CIDR-range med /20, /21 eller /22 subnet mask.
    ){
        this.Navn = Navn
        this.UnikID = UnikID
        this.Naboer = Naboer
        this.Samlepost = Samlepost
        
        // array med vekter 1:1 med Naboer. ligger ikke i nodefilen
        this.Kant = Array(this.Naboer.length).fill(0)

        if (typeof this.Navn === 'undefined' ||
            typeof this.UnikID === 'undefined' ||
            typeof this.Naboer === 'undefined' ||
            typeof this.Samlepost === 'undefined') {
            throw new Error("ett eller flere av feltene noden er ikke satt");
        }
    }
}

// legger til en knapp for å legge til en kant
function addWeightButton(
    nodeId, //int
    naboIndex, //int
    weight //int
){
    div = document.getElementById("setEdgeWrapper")

    div.innerHTML = "<input type='number' id='addWeightBtn' value='" + getWeight(nodeId, naboIndex) + "'>" +
        "<button onclick='addWeight(" + nodeId + "," + naboIndex + ")'>legg til kant</button>"
}

// legger til weight i kant arrayet til nodene
//tar ikke hensyn til å sjekke om de faktisk er naboer
function addWeight(
    nodeId, //int
    naboId, //int
){

    input = document.getElementById("addWeightBtn").value

    if(input == ""){
        weight = 0
    }
    else{
        weight = Number(input)
    }

    const node1 = nodes[Number(nodeId)]
    const node2 = nodes[Number(naboId)]

    kantIndex1 = node1.Naboer.indexOf(String(naboId))
    kantIndex2 = node2.Naboer.indexOf(String(nodeId))

    node1.Kant[kantIndex1] = weight
    node2.Kant[kantIndex2] = weight

    div = document.getElementById("setEdgeWrapper")
    div.innerHTML = ""

    displayPaths()
}

//returnerer kanten mellom idene
//tar ikke hensyn til å sjekke om de faktisk er naboer
function getWeight(
    nodeId, //int
    naboId //
){
    node = nodes[nodeId]
    kantIndex = node.Naboer.indexOf(String(naboId))

    return node.Kant[kantIndex]
}

// denne funksjonen blir kjørt når "les nodefil" knappen blir trykket
// setter den globale variablen nodes til å bli outputet fra readNodeFile
// nodes er et array av Node elementer
function setNodes(){
    try{
        nodes = validateNodes(readNodeFile())
        drawNodesGraph(nodes)
        findAllPaths(nodes)
    }
    catch(err){
        setErrorMessage(err)
    }
}

// sjekker at forholdene mellom nodene er riktig
// returnerer nodene om alt er riktig
// throw error om noe er feil
function validateNodes(
    nodes //array<Node>
){
    let idIterator = 0
    // sjekk at ider er sekvensielle fra 0-10000
    // flere steder i programmet brukes id-ene for å indeksere inn i array, detter er derfor viktig
    nodes.forEach((node) => {
        if(Number(node.UnikID) != idIterator){
            throw new Error("UnikID må være sekvensielle " + node.UnikID + " bryter sekvensen")
        }
        idIterator++
    })

    // sjekk at alle nabo-relationships er riktig
    nodes.forEach((node) => {
        node.Naboer.forEach((naboId) => {
            const naboNode = nodes[Number(naboId)]

            if(node.Navn == "" && naboNode.Navn == ""){
                throw new Error("node med id " + node.UnikID + " kan ikke være nabo med node " + naboNode.UnikID + ' fordi begge er "" noder')
            }

            if(!naboNode.Naboer.includes(String(node.UnikID))){
                throw new Error("node med id " + node.UnikID + " har en nabo, " + naboId + " som ikke har " + node.UnikID + " som nabo")
            }
        })
    })

    return nodes
}

// returnerer et array med nodes om alt er riktig
// returnerer undefined om noe er feil med inputet
function readNodeFile(){

    nodeFileContent = document.getElementById("nodefileTextArea").value

    if(nodeFileContent == ""){
        setErrorMessage("nodefile cant be empty")
        return
    }

    // read content line by line
    let lines = nodeFileContent.split("\n")

    if(lines.length > 10000){
        setErrorMessage("this nodefile is too long")
        return
    }

    let nodes = []

    try{
        for(let i = 0; i < lines.length; i++){
            let newNode = parseNodeFileContentLine(lines[i])
            nodes.push(newNode)
        }
    }
    catch(err){
        setErrorMessage(err)
        return
    }

    //hvis alt har gått riktig, kan errorMessage være tom
    setErrorMessage("")

    return nodes
}

// henter ut innholdet fra en linje 
// returnerer et object av klassen Node
// throws error om ikke linjen eer valid
function parseNodeFileContentLine(
    line //string: line from nodeFile
){

    if(line == "" || line == "\n"){
        throw new Error("lines cant be empty")
    }

    // Bruker samme format som i eksempelfilen: https://gitlab.com/mathias_ws/oppgaver-til-kandidater#oppgave-x2---a-walk-in-the-graf
    
    line = validateLineJson(line)

    navn = validateName(line.Navn)

    unikID = validateID(line.UnikID)

    naboer = validateNaboer(line.Naboer, navn)

    samlepost = validateSamlepost(line.Samlepost, navn)

    return new Node(navn, unikID, naboer, samlepost)
}

// validerer om linjen kan parses som json (med en brackets rundt)
// returnerer linjen som et json objekt om suksess
// throws error om ikke suksess
function validateLineJson(
    line // string
){
    try{
         return line = JSON.parse("{" + line + "}")
    }
    catch(err){
        throw new Error("klarte ikke parse linje som json", { cause: err });
    }
}

// validerer om navnet er gyldig eller ikke
// returnerer navnet om det er gyldig
// throw error om navnet ikke er gyldig
function validateName(
    navn // string
){
    if(navn != "" && navn != "R" && navn != "S"){
        throw new Error('navn må være "", "R" eller "S". ' + navn + " passer ikke denne beskrivelsen")
    }
    return navn
}

// validerer om IDen er gyldig
// returnerer IDen om den er gyldig
// throw error om IDen ikke er gyldig
function validateID(
    unikID //number
){
    if(isNaN(Number(unikID))){
        throw new Error("unik id må være et tall")
    }
    if(unikID < 0 || unikID > 10000){
        throw new Error("unik id må være mellom 0 og 10000. " + unikID +" passer ikke denne beskrivelsen")
    }
    return unikID
}

// validerer om nodene har for mange naboer
// validerer om alle naboene er gyldige tall
// returnerer naboene om alt er gyldig
// throw error om noe ikke er gyldig
function validateNaboer(
    naboer, //array [string]
    navn //string
){

    blankNodeMaxLength = 2
    sAndRNodeMaxLength = 256


    if(navn == "" && naboer.length > 2){
        throw new Error('En "" node kan kun ha ' + blankNodeMaxLength + ' naboer')
    }

    if((navn == "R" || navn == "S") && naboer.length > sAndRNodeMaxLength){
        throw new Error('noder av typen "R" og "S" kan max ha ' + sAndRNodeMaxLength + ' naboer')
    }

    for(let i = 0; i < naboer.length; i++){
        if(isNaN(Number(naboer[i]))){
            throw new Error("nabo: " + naboer[i] + " er ikke et tall")
        }
    }
    return naboer
}

function validateSamlepost(
    samlepost, //string
    navn //string
){
    if(navn == ""){
        //skal være en RFC1918 IP-adresse med subnet mask /32
        let subnetMask = samlepost.substr(samlepost.length - 3)

        if(subnetMask != "/32"){
            throw new Error("wrong subnet mask: " + subnetMask)
        }

        if(validRFC1918(samlepost.substr(0, samlepost.length - 3)) == false){
            throw new Error("ip er ikke en gyldig RFC1918 IP-adresse")
        }
    }
    if(navn == "R"){
        //skal være en RFC1918 IP-adresse med subnet mask /20, /21 eller /22 
        let subnetMask = samlepost.substr(samlepost.length - 3)

        if(subnetMask != "/20" && subnetMask != "/21" && subnetMask != "/22"){
            throw new Error("wrong subnet mask: " + subnetMask)
        }

        if(validRFC1918(samlepost.substr(0, samlepost.length - 3)) == false){
            throw new Error("ip er ikke en gyldig RFC1918 IP-adresse")
        }
    }
    if(navn == "S"){
        // skal ha tallverdi fra og med "2" til og med "4096"
        samlepostNum = Number(samlepost)

        if(isNaN(samlepostNum)){
            throw new Error('samlepost for "S" type noder må være et tall')
        }

        if(samlepostNum < 2 || samlepostNum > 4096){
            throw new Error('samplepost for "S" type noder må være mellom 2 og 4096')
        }
    }
    return samlepost
}


// setter innholdet til error-message-txt elementet
function setErrorMessage(
    errorMessage //string: feilbeskjeden som vises i feltet
){
    document.getElementById("error-message-text").innerHTML = errorMessage
}

// checks if a string is a valid RFC1918 address
// https://datatracker.ietf.org/doc/html/rfc1918
function validRFC1918(
    ip // ip as string
){

    if(typeof(ip) != "string"){
        throw new Error("ip-addresse må gis som en streng")
    }

    ipSplit = ip.split(".")

    if(ipSplit.length != 4){
        throw new Error("ip-addresse " + ip + " har for få felter")
    }

    //range må være mellom en av blokkene:

    //10.0.0.0 - 10.255.255.255  
    if(ipSplit[0] == 10){
        return checkBetween(ipSplit[1], 0, 255) &&
            checkBetween(ipSplit[2], 0, 255) &&
            checkBetween(ipSplit[3], 0, 255)
    }
    //172.16.0.0 - 172.31.255.255  
    if(ipSplit[0] == 172){
        return checkBetween(ipSplit[1], 16, 31) &&
            checkBetween(ipSplit[2], 0, 255) &&
            checkBetween(ipSplit[3], 0, 255)
    }
    //192.168.0.0 - 192.168.255.255 
    if(ipSplit[0] == 192){
        return checkBetween(ipSplit[1], 168, 168) &&
                checkBetween(ipSplit[2], 0, 255) &&
                checkBetween(ipSplit[3], 0, 255) 
    }


    return false
}

// checks if impNum is between start and end
// returns true or false
function checkBetween(
    inpNum, //int
    start, //int
    end //int
){
    inpNum = Number(inpNum)
    start = Number(start)
    end = Number(end)

    if(isNaN(inpNum) || isNaN(start) || isNaN(end)){
        throw new Error("inpNum, start og end må være tall")
    }
    
    return start <= inpNum && inpNum <= end

}

// Test functions

//runTests()

function runTests(){
    Test_validateName()
    Test_validateID()
    Test_validateNaboer()
    Test_validateSamlepost()
    Test_validRFC1918()
}

function Test_validateName(){
    console.log("navn validering")
    //kjent suksess input
    passFail(validateName("") == "")
    passFail(validateName("S") == "S")
    passFail(validateName("R") == "R")
    passFail(testThrowsError(validateName, "") == false)
    passFail(testThrowsError(validateName, "S") == false)
    passFail(testThrowsError(validateName, "S") == false)
    //kjent feil input
    passFail(testThrowsError("O") == true)
}

function Test_validateID(){
    console.log("id validering") 

    //kjent suksess
    passFail(validateID(0) == 0)
    passFail(validateID(10000) == 10000)
    passFail(validateID(5000) == 5000)
    passFail(testThrowsError(validateID, 0) == false)
    passFail(testThrowsError(validateID, 10000) == false)
    passFail(testThrowsError(validateID, 5000) == false)

    //kjent feil
    passFail(testThrowsError(validateID, -1) == true)
    passFail(testThrowsError(validateID, 10001) == true)
    passFail(testThrowsError(validateID, "A") == true)
}

function Test_validRFC1918(){
    // validRFC1918
    console.log("using number instead of string")
    passFail(testThrowsError(validRFC1918, 11111) == true)

    console.log("too short input")
    passFail(testThrowsError(validRFC1918, "10.10") == true)
    passFail(testThrowsError(validRFC1918, "10.10.10") == true)

    console.log("valid addresses")
    passFail(validRFC1918("10.0.0.0") == true)
    passFail(validRFC1918("172.16.0.0") == true)
    passFail(validRFC1918("192.168.0.0") == true)
    passFail(validRFC1918("10.255.255.255") == true)
    passFail(validRFC1918("172.31.255.255") == true)
    passFail(validRFC1918("192.168.255.255") == true)

    console.log("invalid addresses")
    passFail(validRFC1918("10.0.0.400") == false)
    passFail(validRFC1918("400.16.0.0") == false)
    passFail(validRFC1918("148.168.0.0") == false)
    passFail(validRFC1918("10.255.256.255") == false)
    passFail(validRFC1918("170.0.0.0") == false)
    passFail(validRFC1918("0.0.0.0") == false)
}

function Test_validateNaboer(){
    console.log("nabo validering")
    //kjent korrekt
    passFail(testThrowsError(validateNaboer, [["1", "2"], ""]) == false)
    passFail(testThrowsError(validateNaboer, [[], ""]) == false)
    passFail(testThrowsError(validateNaboer, [[], "S"]) == false)
    passFail(testThrowsError(validateNaboer, [[], "R"]) == false)
    passFail(testThrowsError(validateNaboer, [["1", "2"], "S"]) == false)
    passFail(testThrowsError(validateNaboer, [["1", "2"], "R"]) == false)
    passFail(testThrowsError(validateNaboer, [Array(256).fill("1"), "S"]) == false)
    passFail(testThrowsError(validateNaboer, [Array(256).fill("1"), "R"]) == false)
    //kjent feil input
    passFail(testThrowsError(validateNaboer, [["1", "2", "3"], ""]) == true)
    passFail(testThrowsError(validateNaboer, [Array(257).fill("1"), "S"]) == true)
    passFail(testThrowsError(validateNaboer, [Array(257).fill("1"), "R"]) == true)
}

function Test_validateSamlepost(){
    console.log("samlepost validering")
    // for ip addresser trenger man egentlig bare å teste subnet maskene
    // validRFC1918 har sin egen testfunksjon

    //kjent suksess input
    passFail(validateSamlepost("10.10.0.34/32", "") == "10.10.0.34/32")
    passFail(validateSamlepost("10.12.0.0/20", "R") == "10.12.0.0/20")
    passFail(validateSamlepost("10.12.0.0/21", "R") == "10.12.0.0/21")
    passFail(validateSamlepost("10.12.0.0/22", "R") == "10.12.0.0/22")
    passFail(validateSamlepost("2", "S") == "2")
    passFail(validateSamlepost("4096", "S") == "4096")

    //kjent ugyldig input
    passFail(testThrowsError(validateSamlepost, ["10.10.0.34/30", ""]) == true)
    passFail(testThrowsError(validateSamlepost, ["10.12.0.0/23", "R"]) == true)
    passFail(testThrowsError(validateSamlepost, ["1", "S"]) == true)
    passFail(testThrowsError(validateSamlepost, ["4097", "S"]) == true)
}

//prints passed/failed based on the input bool
function passFail(
    result //bool
){
    if(result === true){
        console.log("passed")
    }
    else if(result == false){
        console.error("failed")
    }
    else{
        throw new Error("input was neither true of false")
    }
}


// tester om funksjonen thrower en error med det gitte inputet
// returnerer true om error er thrown
// returnerer false om error ikke er thrown
function testThrowsError(
    testFunction, //function
    input //input til funksjonen
){
    try{
        if(Array.isArray(input)){
            testFunction(...input)
        }
        else{
            testFunction(input)
        }
    }
    catch(err){
        return true
    }
    return false
}
