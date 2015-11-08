// ---------------------------------------------------------------------------
// Tool box class:
// ---------------------------------------------------------------------------

function ToolBox(theImage, theSelectedTool)
{
   this.image = theImage;
   this.mouseOverTool = "";
   this.selectedTool = theSelectedTool;
   this.tools = {};
}

// ---------------------------------------------------------------------------

ToolBox.prototype.addTool = function (theTool, 
                                      theX, 
                                      theY, 
                                      theWidth, 
                                      theHeight,
                                      theToolTip)
{
   this.tools[theTool] = 
   { 
      x:       theX, 
      y :      theY, 
      width:   theWidth, 
      height:  theHeight,
      toolTip: theToolTip
   };
}

// ---------------------------------------------------------------------------

ToolBox.prototype.draw = function (ctx)
{
   ctx.save();
   for (var toolName in this.tools)
   {
      var tool = this.tools[toolName];
      if (this.selectedTool == toolName)
      {
         ctx.fillStyle = 'Orange';
      }
      else
      if (this.mouseOverTool == toolName)
      {
         ctx.fillStyle  = 'DarkGrey';        
      }
      else
      {
         ctx.fillStyle  = 'LightGrey';
      }
      ctx.fillRect(tool.x, tool.y, tool.width, tool.height);
      ctx.drawImage(
         this.image,
         tool.x,
         tool.y,
         tool.width,
         tool.height,                       
         tool.x, 
         tool.y,
         tool.width,
         tool.height); 
   }
   
   // Draw tool tip
   if (this.mouseOverTool in this.tools)
   {
      var tool = this.tools[this.mouseOverTool];
      if (tool.toolTip)
      {
         ctx.font = "12px sans-serif";
         var textMetrics = ctx.measureText(tool.toolTip);
         ctx.fillStyle = "rgba(255, 255, 255, 1)";
         var boxX = tool.x + tool.width + 2;
         var boxY = tool.y + tool.height - (12 + 8); 
         ctx.shadowOffsetX = 3;
         ctx.shadowOffsetY = 3;
         ctx.shadowBlur = 5;
         ctx.shadowColor = 'black';
         ctx.fillRect(boxX, 
                      boxY, 
                      textMetrics.width + 8, 
                      12 + 8);
         ctx.shadowOffsetX = 0;
         ctx.shadowOffsetY = 0;
         ctx.shadowBlur = 0;
         ctx.strokeStyle = 'grey';  
         ctx.lineWidth = 1;         
         ctx.strokeRect(boxX, 
                       boxY, 
                       textMetrics.width + 8, 
                       12 + 8);
         ctx.textAlign = "center";
         ctx.textBaseline = "middle"; 
         ctx.fillStyle  = 'black';
         ctx.fillText(tool.toolTip, boxX + (textMetrics.width  + 8) / 2, boxY  + (12 + 8) / 2);      
         ctx.strokeStyle = 'black';         
      }
   }
   ctx.restore();          
}

// ---------------------------------------------------------------------------

ToolBox.prototype.getTool = function(theMousePos)
{
   for (var toolName in this.tools)
   {
      var tool = this.tools[toolName];
      if (theMousePos.x >= tool.x && theMousePos.x <= tool.x + tool.width &&
          theMousePos.y >= tool.y && theMousePos.y <= tool.y + tool.height)
      {
         return toolName;
      }
   }
}

// ---------------------------------------------------------------------------

ToolBox.prototype.onMouseClick = function(theMousePos)
{
   var toolName = this.getTool(theMousePos);
   if (toolName)
   {
      this.selectedTool = toolName;
      return true;
   }
   return false;
}

// ---------------------------------------------------------------------------

ToolBox.prototype.onMouseMove = function(theMousePos)
{
   var mouseOverTool = this.getTool(theMousePos);
   if (mouseOverTool != this.mouseOverTool)
   {
      this.mouseOverTool = mouseOverTool;
      return true;
   }
   return false;
}
