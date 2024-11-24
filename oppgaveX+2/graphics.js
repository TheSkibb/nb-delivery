// i senne filen er logikken for å tegne nodene

class Circle{
    constructor(
        centerX, //number
        centerY, //number
        radius //number
    ){
        this.centerX = centerX
        this.centerY = centerY
        this.radius  = radius
    }
}

        
function drawCircle(
    ctx, //canvas context
    circle //Circle
){
    ctx.beginPath();
    ctx.arc(circle.centerX, circle.centerY, circle.radius, 0, 2 * Math.PI, false);
    
    ctx.lineWidth = 1; 
    ctx.strokeStyle = 'black'; 
    ctx.stroke(); 
};

// returnerer Circle objektet for punktet som ble tegnet
function drawPointOnCircle(
    ctx, //canvas context
    circle, //Circle
    angle, //number: degrees
    id
){
    //convert angle to radians
    angle =  angle * (Math.PI / 180);
    const x = circle.centerX + circle.radius * Math.cos(angle);
    const y = circle.centerY + circle.radius * Math.sin(angle);
    const pointRadius = 10

    pointCircle = new Circle(x, y, pointRadius)

    drawCircle(ctx, pointCircle)

    ctx.fillText(id, x+15, y)

    return pointCircle
}

function drawLine(
    ctx, //canvas context
    startX, //number
    startY, //number
    endX,//number
    endY//number
){
    // Start a new Path
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    // Draw the Path
    ctx.stroke();
}

function drawNodesGraph(
    nodes //array of Node objects
) {
    var canvas = document.getElementById('nodeGraphic');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define the circle parameters

    let bigCircle = new Circle(canvas.width / 2, canvas.height / 2, 350)
    drawCircle(ctx, bigCircle)

    let littleCircle = new Circle(canvas.width / 2, canvas.height / 2, 200)
    drawCircle(ctx, littleCircle)

    var angleInc = Math.floor(360 / nodes.length)

    var points = [] //1:1 to nodes

    // draw points for all the nodes
    for(i = 0; i < nodes.length; i++){
        let point
        if(nodes[i].Navn == ""){
            point = drawPointOnCircle(ctx, bigCircle, angleInc * i, nodes[i].UnikID)
        }
        else{
            point = drawPointOnCircle(ctx, littleCircle, angleInc * i, nodes[i].UnikID)
        }
        points.push(point)
    }

    if(points.length != nodes.length){
        throw new Error("the length node list and point list do not match")
    }

    // Tegn linjene mellom alle noder og naboene
    nodes.forEach((node) => {
            //console.log(node)
        node.Naboer.forEach((naboIndex) => {
            const nodeX = points[node.UnikID].centerX
            const nodeY = points[node.UnikID].centerY
            const naboX = points[Number(naboIndex)].centerX
            const naboY = points[Number(naboIndex)].centerY
            drawLine(ctx, nodeX, nodeY, naboX, naboY)

        })
    })
}

function degreeToRadians (angle) {
  return angle * (Math.PI / 180);
}
