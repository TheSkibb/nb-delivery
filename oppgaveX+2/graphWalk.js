// i denne filen ligger logikken for å gå finne alle 
// findAllPaths blir kalt i nodes.js når nodene er blitt lest inn fra filen

var allPaths = []

// returnerer et array med nodes og alle de mulige pathene
function findAllPaths(
    nodes // array med Noder
){
    let goalNodes = []
    allPaths = []
    nodes.forEach((node) => {

        //vi er bare interresert i stier mellom unnamed nodes
        if(node.Navn != ""){
            return
        }

        // finn ut hvilke noder vi vil finne stier mellom
        reachableNodes = findGoalNodes(nodes, node)

        // finn ut hvilke noder vi vil finne path mellom
        goalNodes = reachableNodes.filter((nodeIndex) => 
            nodes[nodeIndex].Navn == "" && 
            nodeIndex != Number(node.UnikID)
        )

        // finn alle paths mellom nodene
        if(goalNodes.length == 0){
            return []
        }
        goalNodes.forEach((goal) => {
            const paths = []
            if(!checkPathExists(allPaths, node.UnikID, goal)){
                findPaths(node, goal, nodes, [], paths)
            }

            allPaths.push({
                "start": node.UnikID,
                "end": goal,
                "paths": paths
            })
        })
    })
    displayPaths(allPaths)
}

// dfs basert søk etter alle stier
// returnerer et array med paths, som er arrayer med id-er
// const dfs = (graph, start, end, path, allPaths) => {
const findPaths = (
    start, //Node
    end, //int
    nodes, //array<Node>
    path, //array<Node.UnikId>
    allPaths, //array<path>
) => {
    path.push(start.UnikID);

    if (start.UnikID === end) {
        allPaths.push([...path]); 
    } else {
        for (let nabo of nodes[start.UnikID].Naboer) {
            const naboNode = nodes[Number(nabo)]
            if (validatePath(path, nabo, nodes)) { 
                findPaths(nodes[nabo], end, nodes, path, allPaths);
            }
        }
    }

    path.pop(); 
}

// grafen er urettet, derfor må man sjekke om stiene kommer to ganger
// returnerer true om stien allerede er i arrayet
// returns false om ikke den er det
function checkPathExists(
    allPaths, //array<path>
    start, //int
    end //int
){
    var hasPath = false

    allPaths.forEach((path) => {
        if(path.start == end && path.end == start){
            hasPath = true
        }
    })

    console.log(hasPath, start, end)

    return hasPath
}


// tar inn en sti, som er et array med node-IDer
// returnerer stien om den er gyldig
// returnerer null om ikke gyldig
// se oppgaveteksten for krav til valid sti
// https://gitlab.com/mathias_ws/oppgaver-til-kandidater#oppgave-x2---a-walk-in-the-graf
function validatePath(
    path, // object {start: int, end: int, paths: array<int>}
    nabo, // int
    nodes //array<Node>
){

    //Så fremt ingen noder besøkes to ganger i samme sti.
    const doubleVisit = !path.includes(Number(nabo))

    const lastElement = nodes[path[path.length - 1]]
    const naboNode = nodes[Number(nabo)]
    
    //maksimalt inneholder to ""-noder.

    var blankNodeOverlapping = false

    //hver ""-node til alle "S"-noder og til alle "R"-noder hvor CIDR-rangen i Samlepost ikke overlapper hverandre.
    if(lastElement.Navn == "" && naboNode.Navn == "R"){
        blankNodeOverlapping = cidrRangesOverlap(lastElement.Samlepost, naboNode.Samlepost)

    }
    
    //"S"-node til alle noder, foruten andre "S"-noder med ulik tallverdi i Samlepost.
    let sNodeSameSamlepost = true

    if( naboNode.Navn == "S" && lastElement.Navn == "S"){
        sNodeSameSamlepost = (lastElement.Samlepost === naboNode.Samlepost)
    }

    //const sNodeSameSamlepost = true

    //"R"-node til alle noder, så fremt ingen nåværende eller fremtdig ""-node i stien ikke overlapper CIDR-rangen til "R"-noden.
    let rNodeOverlapping = false

    if(lastElement.Navn == "R"){
        path.forEach((nodeId) => {
            const node = nodes[nodeId]
            if(node.Navn == "" && node.Samlepost == lastElement.Samlepost){
                rNodeOverlapping = true
                return
            }
        })
    }

    return !blankNodeOverlapping && doubleVisit && sNodeSameSamlepost && !rNodeOverlapping
}

function getAllIndexes(
    arr, //array <any>
    val //any
) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

//gjør et bfs søk fra noden og returnerer alle noder
//returnerer et array med alle noder som er mulig å dra til
function findGoalNodes(
    nodes, //array<Node>
    node // Node
){
    let queue = [Number(node.UnikID)]
    let visited = []

    while(queue.length != 0){
        const visiting = queue.shift()

        const visitingNaboer = nodes[visiting].Naboer

        visitingNaboer.forEach((nabo) => {
            if(visited.includes(Number(nabo)) != true){
                queue.push(Number(nabo))
                visited.push(Number(nabo))
            }
        })
    }

    return visited
}

// setter innholdet til displayArea til å være stiene
function displayPaths(
){
    displayArea = document.getElementById("pathDisplayWrapper")

    let outputStr= ""

    const displayStrings = []

    allPaths.forEach((path) => {
        displayStrings.push(pathToString(path))
    })

    // sorter stiene etter kantlengde, eller alfabetisk, om de er like
    displayStrings.sort((a, b) => {
    if (a.totalWeight === b.totalWeight) {
        return a.outString.localeCompare(b.outString);
    } 
    else {
            return b.totalWeight - a.totalWeight;
    }});

    displayStrings.forEach((str) => {
        outputStr += str.outString
    })

    displayArea.innerHTML = outputStr
}

// tar imot en sti
// returnerer et objekt med stien som en streng og totalvekten
function pathToString(
    path // object {start: int, end: int, paths: array<int>}
){
    let outString = ""
    let totalWeight = 0
    path.paths.forEach((path, i) =>{
        for(let i = 0; i < path.length; i++){
            node = path[i]
            if(i != 0){
                outString += "<button onclick='addWeightButton(" + path[i] + "," + path[i-1] + ")'> => </button>" 
                totalWeight += getWeight(path[i], path[i-1])
            }
            outString += nodes[path[i]].UnikID
        }
        outString += " - kant: " + totalWeight
        outString += "<br>"
    })

    return { outString: outString, totalWeight: totalWeight }
}

//ai generert kode for å sjekke om to cidr ranger overlapper
function ipToLong(ip) {
    return ip.split('.').reduce((long, octet) => (long << 8) + parseInt(octet, 10), 0) >>> 0;
}

function getCidrRange(cidr) {
    const [base, maskLength] = cidr.split('/');
    const baseLong = ipToLong(base);
    const maskLengthInt = parseInt(maskLength, 10);
    const mask = maskLengthInt === 32 ? 0xFFFFFFFF : -1 << (32 - maskLengthInt);
    const start = baseLong & mask;
    const end = baseLong | (~mask >>> 0);
    return { start, end };
}

function cidrRangesOverlap(cidr1, cidr2) {
    const range1 = getCidrRange(cidr1);
    const range2 = getCidrRange(cidr2);
    return range1.start <= range2.end && range2.start <= range1.end;
}

//test the functions

runTests()

function runTests(){
    passFail(cidrRangesOverlap("192.168.1.0/24", "192.168.1.128/25") == true)
    passFail(cidrRangesOverlap("192.168.1.0/24", "192.168.2.0/24") == false)

    //eksempelet fra oppgaveteksten, ifølge teksten skal disse overlappe, men får ikke det til å stemme
    passFail(cidrRangesOverlap("10.13.0.2/32", "10.12.0.0/22") == true)
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

var exampleNodes = [
    {
        "Navn": "",
        "UnikID": 0,
        "Naboer": [
            "2"
        ],
        "Samlepost": "10.10.0.34/32",
        "Kant": [
            0
        ]
    },
    {
        "Navn": "S",
        "UnikID": 1,
        "Naboer": [
            "2",
            "5"
        ],
        "Samlepost": "341",
        "Kant": [
            0,
            0
        ]
    },
    {
        "Navn": "R",
        "UnikID": 2,
        "Naboer": [
            "0",
            "1",
            "4"
        ],
        "Samlepost": "10.12.0.0/22",
        "Kant": [
            0,
            0,
            0
        ]
    },
    {
        "Navn": "",
        "UnikID": 3,
        "Naboer": [],
        "Samlepost": "10.12.3.211/32",
        "Kant": []
    },
    {
        "Navn": "",
        "UnikID": 4,
        "Naboer": [
            "2",
            "5"
        ],
        "Samlepost": "192.168.3.10/32",
        "Kant": [
            0,
            0
        ]
    },
    {
        "Navn": "S",
        "UnikID": 5,
        "Naboer": [
            "1",
            "4"
        ],
        "Samlepost": "2052",
        "Kant": [
            0,
            0
        ]
    }
]


