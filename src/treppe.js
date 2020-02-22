var greenToRed = function (pos) {
  var max = 255
  var r = pos >= 0.5 ? max : 2 * pos * max
  var g = pos <= 0.5 ? max : (max - ((pos - 0.5) * 2 * max))
  var b = 0
  return "rgb(" + r + "," + g + "," + b + ")"
}

var bft_to_kmh = function (bft) {
  return Math.pow(bft, 1.5) * 3.010
}

function degToBg(degrees) { return degrees * Math.PI / 180; }
function tan(degrees) { return Math.tan(degToBg(degrees)) }




ctx = document.getElementById('canvasInAPerfectWorld').getContext("2d");
// ***** data begin
var bftMax = 13
var kmhMax = 140
// ***** data end

class Area {
  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.width = right - left;
    this.height = bottom - top;
  }

  newInnerArea(deltaLeft, deltaTop, deltaRight, deltaBottom) {
    return new Area(this.left + deltaLeft, this.top + deltaTop, this.right - deltaRight, this.bottom - deltaBottom)
  }
  setColor(color) {
    ctx.strokeStyle = color;
  }

  fill(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.left, this.top, this.width, this.height);
  }

  drawLine(left, top, toRight, toBottom) {
    ctx.beginPath();
    ctx.moveTo(this.left + left, this.top + top);
    ctx.lineTo(this.left + left + toRight, this.top + top + toBottom);
    ctx.stroke()
  }

  printText(text, x, y, color, font, align) {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.fillText(text, this.left + x, this.top + y);
  }

  forEachX(applier) { // applier -> function(x, xPercent), wobei x relativ zum aktuellen frame, percent --> Wer zwischen 0 und 1
    for (var x = 0; x < this.width; x++) {
      applier(x, (1 + x) / this.width)
    }
  }
}

// ***** fill background
var total = new Area(0, 0, ctx.canvas.width, ctx.canvas.height)
total.fill("white")

// ***** start drawing
var chartArea = total.newInnerArea(50, 50, 50, 50)

var faktor = 4

// ***** Außenmaße
var treppeBreite = 90 * faktor
var treppeLaenge = 220 * faktor
chartArea.setColor("black")
chartArea.drawLine(0, 0, treppeBreite, 0)             // oben
chartArea.drawLine(0, 0, 0, treppeLaenge)             // links
chartArea.drawLine(0, treppeLaenge, treppeBreite, 0)  // unten
chartArea.drawLine(treppeBreite, 0, 0, treppeLaenge)  // rechts


// ***************************
// ***** Treppe **************
// http://trepedia.de/entwerfen/treppenverziehung/winkelmethode/


var stufen = 11
var stufenLaenge = treppeLaenge / stufen
function zeichneOriginalStufen(ueberspringeErsteNStufen) {
  for (var i = 1 + ueberspringeErsteNStufen; i < stufen; i++) {
    chartArea.drawLine(0, i * stufenLaenge, treppeBreite, 0)
  }

}


// ***** Treppe original
if (true) {
  chartArea.setColor("yellow")
  zeichneOriginalStufen(0)
}


// ***** Treppe einfacher Radius
if (false) {
  var stufenMitRadius = 4
  chartArea.setColor("green")
  zeichneOriginalStufen(stufenMitRadius)

  var startTop = stufenLaenge * stufenMitRadius
  var radius = 90 / stufenMitRadius
  for (var i = 0; i <= stufenMitRadius; i++) {
    var a = tan(radius * i) * treppeBreite
    console.log(radius * i)
    console.log(treppeBreite / faktor)
    console.log(a / faktor)

    chartArea.drawLine(treppeBreite, startTop, -treppeBreite, -a)
  }
}

// ***** Treppe manuell
if (true) {



  //         #1  #2  #3  #4  #5  #6  #7  #8  #9  #10 (#11)
  var v = 5

  if (v == 1) { // alle gerade
    var l = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200]
    var r = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200]
  } else if (v == 2) { // simpler schwung
    var l = [0, 20, 40, 60, 83, 109, 138, 169, 214, 274, 384]
    var r = [0, 20, 40, 60, 77, 91, 102, 111, 118, 124, 129]
  } else if (v == 3) { // schwung, gute Mittelbreite 1
    var l = [0, 18, 36, 54, 73, 22, 25, 27, 34, 46, 110]
    var r = [0, 18, 36, 54, 71, 14, 11, 9, 7, 6, 5]
  } else if (v == 4) { // schwung, gute Mittelbreite, von unten gedreht, zu eng
    var l = [0, 21, 42.5, 64.5, 87, 110, 133.5, 158.5, 186.5, 231.5, 331.5]
    var r = [0, 15, 29.5, 43.5, 57, 70, 82.5, 94.5, 106, 117, 127.5]
  } else if (v == 5) { // unten länger, mittlere Tiefe 20.5
    var l = [-45, -16.5, 12, 40.5, 69, 97.5, 126, 154.5, 186.5, 231.5, 331.5]
    var r = [-5, 7.5, 20, 32.5, 45, 57.5, 70, 82.5, 95, 107.5, 120]
  }


  var cL = treppeLaenge
  var cR = treppeLaenge
  var middlePointX = treppeBreite / 2
  var middlePointY = (cL + cR) / 2

  l.forEach(function (dL, i) {
    dL = dL * faktor
    dR = r[i] * faktor

    cL = treppeLaenge - dL
    cR = treppeLaenge - dR

    chartArea.setColor("green")
    chartArea.drawLine(0, cL, treppeBreite, cR - cL)


    // draw middle line
    if (cL > 0) {
      var newMiddlePointX = treppeBreite / 2 // TODO recalculate
      var newMiddlePointY = (cL + cR) / 2
    } else {
      var x2 = treppeBreite / ((-cL / cR) + 1)
      var x1 = treppeBreite - x2

      var newMiddlePointX = x2 / 2 + x1
      var newMiddlePointY = cR / 2
    }

    chartArea.setColor("lightPink")
    chartArea.drawLine(middlePointX, middlePointY, newMiddlePointX - middlePointX, newMiddlePointY - middlePointY)

    var distance = Math.sqrt(
      (newMiddlePointX - middlePointX) * (newMiddlePointX - middlePointX)
      +
      (newMiddlePointY - middlePointY) * (newMiddlePointY - middlePointY)
    ) / faktor

    console.log("==== Stufe " + (i + 1) + " =====")
    console.log("original von: ")
    console.log("original bis: ")

    if (i > 0)
      console.log("Mittel Stufe " + (i) + ": " + distance)
    middlePointX = newMiddlePointX
    middlePointY = newMiddlePointY
  })

  var newMiddlePointX = treppeBreite
  var newMiddlePointY = cR / 2

  chartArea.setColor("lightPink")
  chartArea.drawLine(middlePointX, middlePointY, newMiddlePointX - middlePointX, newMiddlePointY - middlePointY)

  var distance = Math.sqrt(
    (newMiddlePointX - middlePointX) * (newMiddlePointX - middlePointX)
    +
    (newMiddlePointY - middlePointY) * (newMiddlePointY - middlePointY)
  ) / faktor

  var breiteStufe11 = (treppeLaenge / faktor) - ( r[10])
  console.log("Mittel Stufe 11: " + distance + "   .... Breite: " + breiteStufe11)

}

var whiteArea = total.newInnerArea(0, 0, 0, total.height - 50)
whiteArea.fill("white")



ctx.stroke()

