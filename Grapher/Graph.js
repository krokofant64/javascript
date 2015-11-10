// ---------------------------------------------------------------------------

function valueInRange(theValue, theMin, theMax)
{
   return (theValue >= theMin) && (theValue <= theMax);
}

// ---------------------------------------------------------------------------

function drawArrow(theStartPoint, theEndPoint)
{
   ctx.beginPath();
   ctx.moveTo(theStartPoint.x, theStartPoint.y);
   ctx.lineTo(theEndPoint.x, theEndPoint.y);
   ctx.stroke();

   // calculate the angle of the line
   var length = 10;
   var angle = Math.PI / 8;
   var lineangle = Math.atan2(theEndPoint.y - theStartPoint.y, theEndPoint.x - theStartPoint.x);
   // h is the line length of a side of the arrow head
   var h = Math.abs(length / Math.cos(angle));
   var angle1 = lineangle + Math.PI + angle;
   var topx = theEndPoint.x + Math.cos(angle1) * h;
   var topy = theEndPoint.y + Math.sin(angle1) * h;
   var angle2 = lineangle + Math.PI - angle;
   var botx = theEndPoint.x + Math.cos(angle2) * h;
   var boty = theEndPoint.y + Math.sin(angle2) * h;
   ctx.beginPath();
   ctx.moveTo(topx, topy);
   ctx.lineTo(theEndPoint.x, theEndPoint.y);
   ctx.lineTo(botx, boty);
   // curved filled, add the bottom as an arcTo curve and fill
   var backdist = Math.sqrt(((botx - topx) * (botx - topx)) + ((boty - topy) * (boty - topy)));
   ctx.arcTo(theEndPoint.x, theEndPoint.y, topx, topy, .55 * backdist);
   ctx.fill();
}

// ---------------------------------------------------------------------------

function lineRectangleIntersection(
   theLineX0,
   theLineY0,
   theLineX1,
   theLineY1,
   theRectLeft,
   theRectTop,
   theRectRight,
   theRectBottom)
{
   var result = { intersect: false, x: 0, y: 0};
   
   var dx = theLineX1 - theLineX0;
   var dy = theLineY1 - theLineY0;

   if (dx == 0 && dy == 0)
   {
      // no line - no intersection
      return result;
   }   

   // x = x1 + dx * tx
   // calculate tx at the intersection point with a vertical border
   var tx;
   if (dx != 0) 
   {
      var edge = (dx < 0) ? theRectLeft : theRectRight; 
      tx = (edge - theLineX0) / dx;
   }
   // y = y1 + dy * ty
   // calculate ty at the intersection point with a vertical border
   var ty;
   if (dy != 0) 
   {
      var edge = (dy < 0) ? theRectTop : theRectBottom; 
      ty = (edge - theLineY0) / dy;
   }
      
   // take the shorter one
   var t;
   if (dx == 0)
   {
      t = ty;
   }
   else 
   if (dy == 0)
   {
      t = tx;
   }
   else
   {
      t = Math.min(tx, ty);
   }
   if (t < 0)
   {
      // start point of line is outside rectangle
      return result; 
   }
   
   // calculate the coordinates of the intersection point.
   if (t <= 1)
   {
      result.x = theLineX0 + dx * t;
      result.y = theLineY0 + dy * t;
      result.intersect = true;
      return result;
   }
   
   // intersection point is beyond end point of line.
   return result;
}

// ---------------------------------------------------------------------------
// Graph class:
// ---------------------------------------------------------------------------

function Graph()
{
   this.nodes = [];
   this.selectedNode = null;
}

// ---------------------------------------------------------------------------

Graph.prototype.addNode = function(theNode)
{
   this.nodes[this.nodes.length] = theNode;
}

// ---------------------------------------------------------------------------

Graph.prototype.deleteSelectedNode = function ()
{
   if (!this.selectedNode)
   {
      // no node selected
      return;
   }
   for (var i = 0; i < this.nodes.length; i++)
   {
      this.nodes[i].removeChild(this.selectedNode);
   }
   var index = this.nodes.indexOf(this.selectedNode);
   if (index != -1)
   {
      // Remove child
      console.log("Remove node " + this.selectedNode.text); 
      this.nodes.splice(index, 1);
   }
}

// ---------------------------------------------------------------------------

Graph.prototype.draw = function (ctx)
{
   for (var i = 0; i < this.nodes.length; i++)
   {
      this.nodes[i].draw(ctx, this.nodes[i] == this.selectedNode);
   }
}

// ---------------------------------------------------------------------------

Graph.prototype.getHitNode = function (thePosition)
{
   for (var i = 0; i < this.nodes.length; i++)
   {
      if (this.nodes[i].hitTest(thePosition))
      {
         return this.nodes[i];
      }
   }
   return null;
}

// ---------------------------------------------------------------------------

Graph.prototype.overlaps = function (theNode)
{
   for (var i = 0; i < this.nodes.length; i++)
   {
      if (this.nodes[i] != theNode)
      {
         if (this.nodes[i].overlaps(theNode))
         {
            return true;
         }
      }
   }
   return false;
}

// ---------------------------------------------------------------------------

Graph.prototype.selectNode = function (theNode)
{
   this.selectedNode = theNode;
}

// ---------------------------------------------------------------------------
// Node class:
// ---------------------------------------------------------------------------

function Node(thePosition, theText)
{
   this.width = ctx.measureText(theText).width + 10;
   this.height = 20;
   this.text = theText;
   this.x = thePosition.x - this.width / 2;
   this.y = thePosition.y + this.height / 2;
   this.children = [];
}

// ---------------------------------------------------------------------------

Node.prototype.addChild = function (theChild)
{
   console.log(this.text + " addChild " + theChild.text); 
   if (this.children.indexOf(theChild) == -1)
   {
      // New Child
      this.children.push(theChild);
      return true;
   }
   return false;
}

// ---------------------------------------------------------------------------

Node.prototype.draw = function (ctx, theIsSelected)
{
   ctx.fillStyle = "rgba(0, 0, 200, 1)"; 
   ctx.fillRect(this.x, 
                this.y, 
                this.width, 
                this.height);
   if (theIsSelected == true)
   {
      ctx.strokeStyle = "rgba(200, 0, 0, 1)";
      ctx.strokeRect(this.x, 
                     this.y, 
                     this.width, 
                     this.height);
   }
   ctx.textAlign = "center";
   ctx.textBaseline = "middle"; 
   ctx.fillStyle  = 'lightskyblue';
   ctx.fillText(this.text, this.x + this.width / 2, this.y  + this.height / 2); 
   ctx.fillStyle  = "rgba(200, 0, 0, 1)";
   ctx.strokeStyle = "rgba(200, 0, 0, 1)";
   for (var i = 0; i < this.children.length; i++)
   {
      this.drawArrowToNode(ctx, this.children[i]);
   }   
}

// ---------------------------------------------------------------------------

Node.prototype.drawArrowToNode = function (ctx, theNode)
{
   var startPoint = lineRectangleIntersection(this.x + this.width / 2,
                                              this.y + this.height / 2,
                                              theNode.x + theNode.width / 2,
                                              theNode.y + theNode.height / 2,
                                              this.x,
                                              this.y,
                                              this.x + this.width,
                                              this.y + this.height);

   var endPoint = lineRectangleIntersection(theNode.x + theNode.width / 2,
                                            theNode.y + theNode.height / 2,
                                            this.x + this.width / 2,
                                            this.y + this.height / 2,
                                            theNode.x,
                                            theNode.y,
                                            theNode.x + theNode.width,
                                            theNode.y + theNode.height);

   drawArrow(startPoint, endPoint);
}

// ---------------------------------------------------------------------------

Node.prototype.drawArrowToPoint = function (ctx, thePoint)
{
   var startPoint = lineRectangleIntersection(this.x + this.width / 2,
                                              this.y + this.height / 2,
                                              thePoint.x,
                                              thePoint.y,
                                              this.x,
                                              this.y,
                                              this.x + this.width,
                                              this.y + this.height);

   drawArrow(startPoint, thePoint);
}

// ---------------------------------------------------------------------------

Node.prototype.getPosition = function ()
{
   var position = { x: this.x  + this.width / 2, y: this.y + this.height / 2 };
   return position;
}

// ---------------------------------------------------------------------------

Node.prototype.hitTest = function (thePosition)
{
   if (thePosition.x < this.x || thePosition.x > this.x + this.width)
   {
      return false;
   }
   if (thePosition.y < this.y || thePosition.y > this.y + this.height)
   {
      return false;
   }
   return true;
}

// ---------------------------------------------------------------------------

Node.prototype.moveTo = function (thePosition)
{
   this.x = thePosition.x - this.width / 2;
   this.y = thePosition.y - this.height / 2;
}

// ---------------------------------------------------------------------------

Node.prototype.overlaps = function (theNode)
{
   var xOverlap = valueInRange(this.x, theNode.x, theNode.x + theNode.width) ||
                  valueInRange(theNode.x, this.x, this.x + theNode.width);   
   var yOverlap = valueInRange(this.y, theNode.y, theNode.y + theNode.height) ||
                  valueInRange(theNode.y, this.y, this.y + theNode.height);   
   return xOverlap && yOverlap;
}

// ---------------------------------------------------------------------------

Node.prototype.removeChild = function (theChild)
{
   var index = this.children.indexOf(theChild);
   if (index != -1)
   {
      // Remove child
      console.log(this.text + " removeChild " + theChild.text); 
      this.children.splice(index, 1);
   }
}

// ---------------------------------------------------------------------------

Node.prototype.setText = function (theText)
{
   var previousCenterX = this.x + this.width / 2;
   var previousCenterY = this.y - this.height / 2;
   this.width = ctx.measureText(theText).width + 10;
   this.height = 20;
   this.text = theText;
   this.x = previousCenterX - this.width / 2;
   this.y = previousCenterY + this.height / 2;
}
