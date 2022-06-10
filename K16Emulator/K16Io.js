function K16Io()
{
   this.addressLeds      = 0x0000;
   this.dataLeds         = 0xFEDC;
   this.addrDataSwitches = 0x0000;
   this.ctrlSwitches     = 0x0000;
   this.regSwitch     = 0;
   this.counter          = 0;
   this.switchTimestamp  = 0;
   
   this.rgbColorMap = [ "#000000", 
                        "#0000FF", 
                        "#00FF00", 
                        "#00FFFF", 
                        "#FF0000", 
                        "#FF00FF", 
                        "#FFFF00", 
                        "#FFFFFF" ];

   this.redOn      = "#FF0000";
   this.redOff     = "#2F0000";
   this.greenOn    = "#00FF00";
   this.yellowOn   = "#FFD700";
   this.yellowOff  = "#2F2B00";
   this.silver     = "#C0C0C0";
   this.darkSilver = "#707070";
   this.gray       = "#404040";
   this.black      = "#000000";
   this.darkGray   = "#1F1F1F";
   this.white      = "#FFFFFF";

   this.running = 0;
   this.hotSpotRadius = 20;
}

// ----------------------------------------------------------------------------

K16Io.prototype.checkCtrlSwitches = function (theTimestamp)
{
   if (this.ctrlSwitches != 0)
   {
      if (this.switchTimestamp > 0)
      {
         var deltaTime = theTimestamp - this.switchTimestamp;
         if (deltaTime > 250)
         {
            this.ctrlSwitches = 0;
            this.drawCtrlSwitches(304, 335);
            this.switchTimestamp = undefined;
         }
         return;
      }
      this.switchTimestamp = theTimestamp;
   }
}

// ----------------------------------------------------------------------------

K16Io.prototype.clockTick = function ()
{
   this.counter = (this.counter + 1) & 0XFFFFFFFF;
}

// ----------------------------------------------------------------------------

K16Io.prototype.draw = function ()
{
   this.drawLedLine(126, 68, this.addressLeds);
   this.drawLedLine(126, 130, this.dataLeds);

   this.drawSwitchLine(126, 205); 
   this.drawRotarySwitch(198, 333);
   this.drawCtrlSwitches(304, 335);
   if (this.running)
   {
      this.drawRgbLed(126, 335, 2);
   }
   else
   {
      this.drawRgbLed(126, 335, 4);
   }
}

// ----------------------------------------------------------------------------

K16Io.prototype.drawCtrlSwitches = function (x, y)
{
   var position;
   var mask = 0x8000;
   for (var swtch = 0; swtch < 12; swtch += 2)
   {
      if (this.ctrlSwitches & mask)
      {
         position = "up";
      }
      else
      if (this.ctrlSwitches & (mask >> 1))
      {
         position = "down";
      }
      else
      {
         position = "center";
      }
      mask >>= 2;
      this.drawSwitch(x + swtch * 36, y, position);
   }
};

// ----------------------------------------------------------------------------

K16Io.prototype.drawLed = function (x, y, color)
{
   panelCtx.beginPath();
   panelCtx.fillStyle = color;
   panelCtx.arc(x, y, 11, 0, 2 * Math.PI);
   panelCtx.fill();
}

// ----------------------------------------------------------------------------

K16Io.prototype.drawLedLine = function (x, y, value)
{   
   var color;
   var mask = 0x8000;
   for (var led = 0; led < 16; led++)
   {
      if (led & 0x04)
      {
         // yellow
         color = (value & mask) ? this.yellowOn : this.yellowOff;
      }
      else
      {      
         // red
         color = (value & mask) ? this.redOn : this.redOff;
      }
      mask >>= 1;
      this.drawLed(x + led * 36, y, color);
   }
}

// ----------------------------------------------------------------------------

K16Io.prototype.drawRgbLed = function (x, y, theColorIndex)
{   
   panelCtx.beginPath();
   panelCtx.fillStyle = this.rgbColorMap[theColorIndex];
   panelCtx.arc(x, y, 11, 0, 2 * Math.PI);
   panelCtx.fill();
}

// ----------------------------------------------------------------------------

K16Io.prototype.drawRotarySwitch = function (x, y)
{
   panelCtx.save();
   panelCtx.translate(x,y);
   panelCtx.rotate(this.regSwitch * 45 * Math.PI/180)
   panelCtx.translate (-x, -y);
   panelCtx.beginPath();
   panelCtx.fillStyle = this.black;
   panelCtx.arc(x, y, 20, 0, 2 * Math.PI);
   panelCtx.fill();   
   panelCtx.beginPath();
   panelCtx.fillStyle = this.darkGray;
   panelCtx.rect(x - 7 ,y - 18, 14, 36)
   panelCtx.fill();
   panelCtx.beginPath();
   panelCtx.fillStyle = this.white;
   panelCtx.rect(x - 2 ,y - 18, 4, 18)   
   panelCtx.fill();
   panelCtx.restore();
};

// ----------------------------------------------------------------------------

K16Io.prototype.drawSwitch = function (x, y, thePosition)
{
   panelCtx.beginPath();
   panelCtx.fillStyle = this.gray;
   panelCtx.arc(x,y, 17, 0, 2 * Math.PI);
   panelCtx.fill();
   panelCtx.beginPath();
   panelCtx.fillStyle = this.silver;
   panelCtx.arc(x, y, 11, 0, 2 * Math.PI);
   panelCtx.fill();   
   panelCtx.beginPath();
   panelCtx.fillStyle = this.darkSilver;
   panelCtx.arc(x, y, 6, 0, 2 * Math.PI);
   switch (thePosition)
   {
      case "up":
      {
         panelCtx.arc(x, y - 11, 6, 0, 2 * Math.PI);
         panelCtx.rect(x - 5, y - 11, 10, 10);
         break;
      }
      case "down":
      {
         panelCtx.arc(x, y + 11, 6, 0, 2 * Math.PI);
         panelCtx.rect(x - 5 , y + 3, 10, 10);
         break;
      }
      case "center":
      {
         break;
      }
   }
   panelCtx.fill();
}

// ----------------------------------------------------------------------------

K16Io.prototype.drawSwitchLine = function (x, y)
{
   var position;
   var mask = 0x8000;
   for (var swtch = 0; swtch < 16; swtch ++)
   {
      position = (this.addrDataSwitches & mask) ? "up" : "down"; 
      mask >>= 1;
      this.drawSwitch(x + swtch * 36, y, position);
   }
};

// ----------------------------------------------------------------------------

K16Io.prototype.pointInCircle = function (x, y, theCenterX, theCenterY, theRadius)
{
   var dx = x - theCenterX;
   var dy = y - theCenterY;
   
   dist = Math.sqrt(dx * dx + dy * dy);
   return (dist <= theRadius);
}

// ----------------------------------------------------------------------------

K16Io.prototype.stopPushed = function ()
{
   return (this.ctrlSwitches & 0x1000) != 0;
};

// ----------------------------------------------------------------------------

K16Io.prototype.resetPushed = function ()
{
   return (this.ctrlSwitches & 0x2000) != 0;
};

// ----------------------------------------------------------------------------

K16Io.prototype.read = function (theAddress)
{
   switch (theAddress)
   {
      case 0: return this.addrDataSwitches;
      case 1: return this.translateCtrlSwitches();
      case 2: return this.addressLeds;
      case 3: return this.dataLeds;
      case 4: return this.regSwitch;
      case 5: return (this.counter >> 16) & 0xFFFF;
      case 6: return this.counter & 0xFFFF
      case 7: return 0xBAD1;
   }
}

// ----------------------------------------------------------------------------

K16Io.prototype.setAddrDataSwitches = function (x, y, theAddrDataSwitches)
{
   var mask = 0x8000
   for (var swtch = 0; swtch < 16; swtch++)
   {
      var swtchX = 126 + swtch * 36;
      var swtchUpY = 205 - this.hotSpotRadius;
      var swtchDownY = 205 + this.hotSpotRadius;
      
      if (this.pointInCircle(x, y, swtchX, swtchUpY, this.hotSpotRadius))
      {
         return theAddrDataSwitches | mask;
      }

      if (this.pointInCircle(x, y, swtchX, swtchDownY, this.hotSpotRadius))
      {
         return theAddrDataSwitches & (~mask);
      }

      mask >>= 1;
   }
   return theAddrDataSwitches;
};

// ----------------------------------------------------------------------------

K16Io.prototype.setCtrlSwitches = function (x, y, theCtrlSwitches)
{
   var mask = 0x8000
   for (var swtch = 0; swtch < 12; swtch += 2)
   {
      var swtchX = 304 + swtch / 2 * 72;
      var swtchUpY = 335 - this.hotSpotRadius;
      var swtchDownY = 335 + this.hotSpotRadius;
      
      if (this.pointInCircle(x, y, swtchX, swtchUpY, this.hotSpotRadius))
      {
         return (theCtrlSwitches | mask) & (~(mask >> 1));
      }
      
      if (this.pointInCircle(x, y, swtchX, swtchDownY, this.hotSpotRadius))
      {
         return (theCtrlSwitches | (mask >> 1)) & (~mask);
      }
      mask >>= 2;
   }
   return theCtrlSwitches;   
};

// ----------------------------------------------------------------------------

K16Io.prototype.setRotarySwitch = function (x, y)
{
   for (var i = 0; i < 8; i++)
   {
      var angle = (270 + i * 45) * Math.PI/180;
      var centerX = Math.cos(angle) * 30 + 198;
      var centerY = Math.sin(angle) * 30 + 333;
      
      if (this.pointInCircle(x, y, centerX, centerY, 15))
      {
         if (i != this.regSwitch)
         {
            this.regSwitch = i;
            return true;
         }
         return false;
      }
   }
   return false;
};

// ----------------------------------------------------------------------------

K16Io.prototype.setSwitches = function (x, y)
{
   var newAddrDataSwitches = this.setAddrDataSwitches(event.offsetX, event.offsetY, this.addrDataSwitches);
   if (newAddrDataSwitches != this.addrDataSwitches)
   {
      this.addrDataSwitches = newAddrDataSwitches;
      this.drawSwitchLine(126, 205);
   }
   
   var newCtrlSwitches = this.setCtrlSwitches(event.offsetX, event.offsetY, this.ctrlSwitches);
   if (newCtrlSwitches != this.ctrlSwitches)
   {
      this.ctrlSwitches = newCtrlSwitches;
      this.drawCtrlSwitches(304, 335);
   }
   
   if (this.setRotarySwitch(event.offsetX, event.offsetY) == true)
   {
      this.drawRotarySwitch(198, 333);
   }
};

// ----------------------------------------------------------------------------

K16Io.prototype.translateCtrlSwitches = function ()
{
   if (this.ctrlSwitches & 0x8000)
   {
      return DepositRegisterC;
   }
   if (this.ctrlSwitches & 0x4000)
   {
      return ExamineRegisterC;
   }
   if (this.ctrlSwitches & 0x0800)
   {
      return StartC;
   }
   if (this.ctrlSwitches & 0x0400)
   {
      return ContinueC;
   }
   if (this.ctrlSwitches & 0x0200)
   {
      return DepositC;
   }
   if (this.ctrlSwitches & 0x0100)
   {
      return DepositNextC;
   }
   if (this.ctrlSwitches & 0x0080)
   {
      return ExamineC;
   }
   if (this.ctrlSwitches & 0x0040)
   {
      return ExamineNextC;
   }
   if (this.ctrlSwitches & 0x0010)
   {
      return InstStepC;
   }
   return NoneC;
}

// ----------------------------------------------------------------------------

K16Io.prototype.setDebugSwitch = function (theSwitch)
{
   switch (theSwitch)
   {
      case StartC:
      {
         this.ctrlSwitches = 0x0800;
         break;
      }
      case ContinueC:
      {
         this.ctrlSwitches = 0x0400;
         break;
      }
      case InstStepC:
      {
         this.ctrlSwitches = 0x0010;
         break;
      }
      case StopC:
      {
         this.ctrlSwitches = 0x1000;
         break;
      }
      case ResetC:
      {
         this.ctrlSwitches = 0x2000;
         break;
      }
   }
}


// ----------------------------------------------------------------------------

K16Io.prototype.write = function (theAddress, theData)
{
   switch (theAddress)
   {
      case 0: return;
      case 1: return;
      case 2: 
      {
         this.addressLeds = theData;
         break;
      }
      case 3: 
      {
         this.dataLeds = theData;
         break;
      }
      case 4: return;
      case 5: return;
      case 6: return;
      case 7: return;
   }
}

