var SpRegC   = 6;
var PcRegC   = 7;
var NumRegsC = 8;

var AddrSwitchesC = 0xFFF8;
var CtrlSwitchesC = 0xFFF9;
var AddrLedsC     = 0xFFFA;
var DataLedsC     = 0xFFFB;
var RegSwitchesC  = 0xFFFC;

var NoneC            = 0;
var StartC           = 1;
var ContinueC        = 2;
var InstStepC        = 3;
var ExamineC         = 4;
var ExamineNextC     = 5;
var ExamineRegisterC = 6;
var DepositC         = 7;
var DepositNextC     = 8;
var DepositRegisterC = 9;

// ----------------------------------------------------------------------------

function K16Cpu(theMemoryApi)
{
   this.memoryApiM = theMemoryApi;
   this.regM = [0, 0, 0, 0, 0, 0, 0, 0];
   this.addressRegM = 0;
   this.flagsM = { carry: 0, zero: 0, negative: 0, overflow: 0, enableInterupt: 0};
   this.instructionM = 0;
   this.stateM = "FetchInstrE";
   this.tickCountM = 0;
   
   this.runningM = false;
   this.keyValidM = true;
   this.registerIndexM = 0;
}

// ----------------------------------------------------------------------------

K16Cpu.prototype.clockTick = function ()
{
   this.tickCountM++
   switch (this.stateM)
   {
      case "FetchInstrE":
      {
         if (this.runningM)
         {
            this.addressRegM = this.regM[PcRegC];
            this.memoryApiM.setAddress(this.addressRegM);
            this.regM[PcRegC] = (this.regM[PcRegC] + 1) & 0xFFFF;
            this.stateM = "DecodeInstrE";
         }
         else
         {
            this.stateM = "PanelFetchDataE";
         }
         break;
      }
      case "DecodeInstrE":
      {
         this.instructionM = this.memoryApiM.read();
         this.decodeInstruction();
         break;
      }
      case "WaitReadMemE":
      {
         this.readMemReady();
         break;
      }
      case "WaitWriteMemE":
      {
         this.writeMemReady();
         break;
      }
      case "WaitWriteReturnAddressE":
      {
         this.writeReturnAddressReady();
         break;
      }
      default:
      {
         this.handleCtrlPanelStates();
         break;
      }
   }
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeInstruction = function ()
{
   switch ((this.instructionM >> 13) & 0x0007)
   {
      case 0x0000:
      {
         switch ((this.instructionM >> 2) & 0x0003)
         {
            case 0x0000:
            case 0x0001:
            {
               // ALU instructions (ADD, ADC, SUB, SBC, AND, OR, XOR, NOT)
               this.decodeAluInstruction();
               break;
            }
            case 0x0002:
            {
               // Halfword instructions (LD, LDL, LDH, SWP)
               this.decodeHalfwordInstruction();
               break;
            } 
            case 0x0003:
            {
               // Other instructions (INC, DEC, CMP)
               this.decodeOtherInstruction();
               break;
            }  
         }
         break;
      }
      case 0x0001:
      {
         switch ((this.instructionM >> 2) & 0x0003)
         {
            case 0x0000:
            case 0x0001:
            {
               // Shift instructions (SHR, ASHL, SHL, ASHR, ROR, ROL)
               this.decodeShiftInstruction();
               break;
            }
            case 0x0002:
            {
               // Flag instructions (CLC, SEC, CLI, SEI)
               this.decodeFlagInstruction();
               break;
            }
            case 0x0003:
            {
               // Stack instructions (PSH, POP, RET, RTI)
               this.decodeStackInstruction();
               break;
            }
         }
         break;
      }
      case 0x0002:
      {
         // Branch instructions (BCS, BCC, BZS, BZC, BNS, BNC, BOS, BOC))
         this.decodeBranchInstruction();
         break;
      }
      case 0x0003:
      {
         // Load immediate instructions (LDL, LDH, LDLZ, LDHZ)
         this.decodeImmediateInstruction();
         break;
      }
      case 0x0004:
      {
         // Jump instruction (JMP)
         this.decodeJmpInstruction();
         break;
      }
      case 0x0005:
      {
         // Jump subroutine instruction (JSR)
         this.decodeJsrInstruction();
         break;
      }
      case 0x0006:
      {
         // Load from memory instruction (LD mem)
         this.decodeLoadInstruction();
         break;
      }
      case 0x0007:
      {
         // Store to memory instruction (STO mem)
         this.decodeStoreInstruction();
         break;
      }
   }
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeAluInstruction = function ()
{
   var rDest = (this.instructionM >> 10) & 0x007; 
   var rSrc1 = (this.instructionM >> 7) & 0x007; 
   var rSrc2 = (this.instructionM >> 4) & 0x007; 

   var src1 = this.regM[rSrc1];
   var src2 = this.regM[rSrc2];
   var result;

   switch (this.instructionM & 0x0007)
   {
      case 0x0000: // ADD
      {
         var tmpResult = src1 + src2;
         this.setCarryAndOverflowFlag(tmpResult, src1, src2);
         result = tmpResult & 0xFFFF;
         break;
      }
      case 0x0001: // ADC
      {
         var tmpResult = src1 + src2 + this.flagsM.carry;
         this.setCarryAndOverflowFlag(tmpResult, src1, src2);
         result = tmpResult & 0xFFFF;
         break;
      }
      case 0x0002: // SUB
      {
         var tmpResult = src1 - src2;
         this.setCarryAndOverflowFlag(tmpResult, src1, src2);
         result = tmpResult & 0xFFFF;
         break;
      }
      case 0x0003: // SBC
      {
         var tmpResult = src1 - src2 - this.flagsM.carry;
         this.setCarryAndOverflowFlag(tmpResult, src1, src2);
         result = tmpResult & 0xFFFF;
         break;
      }
      case 0x0004: // AND
      {
         result = (src1 & src2);
         break;
      }
      case 0x0005: // OR
      {
         result = (src1 | src2);
         break;
      }
      case 0x0006: // XOR
      {
         result = (src1 ^ src2);
         break;
      }
      case 0x0007: // NOT
      {
         result = ~src1;
         break;
      }
   }
   this.setZeroAndNegativeFlag(result);
   this.regM[rDest] = result;
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeBranchInstruction = function ()
{
   var branch = false;
   switch ((this.instructionM >> 10) & 0x0007)
   {
      case 0x0000: // BCS
      {
         branch = (this.flagsM.carry == 1);
         break;
      }
      case 0x0001: // BCC
      {
         branch = (this.flagsM.carry == 0);
         break;
      }
      case 0x0002: // BZS
      {
         branch = (this.flagsM.zero == 1);
         break;
      }
      case 0x0003: // BZC
      {
         branch = (this.flagsM.zero == 0);
         break;
      }
      case 0x0004: // BNS
      {
         branch = (this.flagsM.negative == 1);
         break;
      }
      case 0x0005: // BNC
      {
         branch = (this.flagsM.negative == 0);
         break;
      }
      case 0x0006: // BOS
      {
         branch = (this.flagsM.overflow == 1);
         break;
      }
      case 0x0007: // BOC
      {
         branch = (this.flagsM.overflow == 0);
         break;
      }
   }
   if (branch == true)
   {
      var rAddress = (this.instructionM >> 7) & 0x007; 
      var address = this.regM[rAddress];
      var offset = this.instructionM & 0x007F;
      if (offset & 0x0040)
      {
         // Negative offset - copy sign to most significant bits
         offset |= 0xFF80;
      }
      this.regM[PcRegC] = (address + offset) & 0xFFFF;
   }
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeFlagInstruction = function ()
{
   switch (this.instructionM & 0x0003)
   {
      case 0x0000: // CLC
      {
         this.flagsM.carry = 0;
         break;
      }
      case 0x0001: // SEC
      {
         this.flagsM.carry = 1;
         break;
      }
      case 0x0002: // CLI
      {
         this.flagsM.enableInterupt = 0;
         break;
      }
      case 0x0003: // SEI
      {
         this.flagsM.enableInterupt = 1;
         break;
      }
   }
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeHalfwordInstruction = function ()
{
   var rDest = (this.instructionM >> 10) & 0x007; 
   var rSrc = (this.instructionM >> 7) & 0x007; 
   var src = this.regM[rSrc];
   var dest = this.regM[rDest];
   var result;

   switch (this.instructionM & 0x0003)
   {
      case 0x0000: // LD
      {
         result = src;
         break;
      }
      case 0x0001: // LDL
      {
         result = (dest & 0xFF00) | (src & 0x00FF);
         break;
      }
      case 0x0002: // LDH
      {
         result = ((src << 8) & 0xFF00) | (dest & 0x00FF); 
         break;
      }
      case 0x0003: // SWP
      {
         result = ((src >> 8) & 0x00FF) | ((src << 8) & 0xFF00);
         break;
      }
   }
   this.setZeroAndNegativeFlag(result);
   this.regM[rDest] = result;
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeImmediateInstruction = function ()
{
   var rDest = (this.instructionM >> 10) & 0x007; 
   var dest = this.regM[rDest];
   var imm = (this.instructionM & 0x00FF);
   var result;

   switch ((this.instructionM >> 8) & 0x0003)
   {
      case 0x0000: // LDL
      {
         result = (dest & 0xFF00) | imm;
         break;
      }
      case 0x0001: // LDH
      {
         result = ((imm << 8) & 0xFF00) | (dest & 0x00FF);
         break;
      }
      case 0x0002: // LDLZ
      {
         result = imm;
         break;
      }
      case 0x0003: // LDHZ
      {
         result = (imm << 8) &  0xFF00; 
         break;
      }
   }
   this.setZeroAndNegativeFlag(result);
   this.regM[rDest] = result;
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeJmpInstruction = function ()
{
   var rAddress = (this.instructionM >> 10) & 0x0007; 
   var address = this.regM[rAddress];
   var offset = this.instructionM & 0x03FF;
   if (rAddress == 0x0007 && offset == 0x03FF)
   {
      this.runningM = 0;
 //     this.regM[PcRegC]--;
      this.stateM = "PanelFetchDataE";
      return;
   }
   if (offset & 0x0200)
   {
      // Negative offset - copy sign to most significant bits
      offset |= 0xFC00;
   }
   this.regM[PcRegC] = (address + offset) & 0xFFFF;
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeJsrInstruction = function ()
{
   this.addressRegM = this.regM[SpRegC];
   this.memoryApiM.setAddress(this.addressRegM);
   this.regM[SpRegC] -= 1;

   this.stateM = "WaitWriteReturnAddressE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeLoadInstruction = function()
{
   var rAddress = (this.instructionM >> 7) & 0x007; 
   var address = this.regM[rAddress];
   var offset = this.instructionM & 0x007F;
   if (offset & 0x0040)
   {
      // Negative offset - copy sign to most significant bits
      offset |= 0xFF80;
   }
   this.addressRegM = address + offset;
   this.memoryApiM.setAddress(this.addressRegM);
   this.stateM = "WaitReadMemE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeOtherInstruction = function ()
{
   var rDest = (this.instructionM >> 10) & 0x007; 
   var rSrc1 = (this.instructionM >> 7) & 0x007; 
   var rSrc2 = (this.instructionM >> 4) & 0x007; 

   var src1 = this.regM[rSrc1];
   var src2 = this.regM[rSrc2];
   var result;
   switch (this.instructionM & 0x0003)
   {
      case 0x0000: // INC
      {
         result = src1 + 1;
         this.setZeroAndNegativeFlag(result);
         this.regM[rDest] = result;
         break;
      }
      case 0x0001: // spare
      {
         break;
      }
      case 0x0002: // CMP
      {
         var tmpResult = src1 - src2;
         this.setCarryAndOverflowFlag(tmpResult, src1, src2);
         result = tmpResult & 0xFFFF;
         this.setZeroAndNegativeFlag(result);
         break;
      }
      case 0x0003: // DEC
      {
         result = src1 - 1;
         this.setZeroAndNegativeFlag(result);
         this.regM[rDest] = result;
         break;
      }
   }
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeShiftInstruction = function ()
{
   var rDest = (this.instructionM >> 10) & 0x007; 
   var rSrc = (this.instructionM >> 7) & 0x007; 

   var src = this.regM[rSrc];
   var result;
   switch (this.instructionM & 0x0007)
   {
      case 0x0000: // SHR
      {
         result = (src >> 1) & 0x7FFF;
         this.flagsM.carry = (src & 0x0001 ? 1 : 0);
         break;
      }
      case 0x0001: // ASHL & SHL
      {
         result = (src << 1) & 0xFFFE;
         this.flagsM.carry = (src & 0x8000 ? 1 : 0);
         break;
      }
      case 0x0002: // ASHR
      {
         if (src && 0x8000)
         {
            // Negative - fill with 1
            result = (src >> 1) | 0x8000; 
         }
         else
         {
            // Positive - fill with 0
            result = (src >> 1) & 0x7FFF; 
         }
         this.flagsM.carry = (src & 0x0001 ? 1 : 0);
         break;
      }
      case 0x0003: // ROR
      {
         var nextCarry = (src & 0x0001 ? 1 : 0); 
         if (this.flagsM.carry == 0)
         {
            result = (src >> 1) & 0x7FFF;
         }
         else
         {
            result = (src >> 1) | 0x8000;
         }
         this.flagsM.carry = nextCarry;
         break;
      }
      case 0x0004: // ROL
      {
         var nextCarry = (src & 0x8000 ? 1 : 0); 
         if (this.flagsM.carry == 0)
         {
            result = (src << 1) & 0xFFFE;
         }
         else
         {
            result = (src << 1) | 0x0001;
         }
         this.flagsM.carry = nextCarry;
         break;
      }
      case 0x0005: // Spare
      case 0x0006: // Spare
      case 0x0007: // Spare
      {
         break;
      }
   }
   this.flagsM.overflow = 0;
   this.setZeroAndNegativeFlag(result);
   this.regM[rDest] = result;
   this.stateM = "FetchInstrE";
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeStackInstruction = function ()
{
   var reg = (this.instructionM >> 10) & 0x007; 

   switch (this.instructionM & 0x0003)
   {
      case 0x0000: // PSH
      {
         this.addressRegM = this.regM[SpRegC];
         this.memoryApiM.setAddress(this.addressRegM);
         this.regM[SpRegC] -= 1;
         this.stateM = "WaitWriteMemE";
         break;
      }
      case 0x0001: // POP; RET
      {
         this.regM[SpRegC] += 1;
         this.addressRegM = this.regM[SpRegC];
         this.memoryApiM.setAddress(this.addressRegM);
         this.stateM = "WaitReadMemE";
         break;
      }
      case 0x0002: // RTI
      {
         break;
      }
      case 0x0003: // Spare
      {
         break;
      }
   }
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.handleCtrlPanelStates = function ()
{
   switch (this.stateM)
   {
      case "StoppedE":
      {
         this.memoryApiM.setAddress(CtrlSwitchesC);
         this.stateM = "PanelWaitCtrlSwitchesE";
         break;
      }
      case "PanelWaitCtrlSwitchesE":
      {
         this.stateM = "PanelDecodeCtrlSwitchesE";
         break;
      }
      case "PanelDecodeCtrlSwitchesE":
      {
         switch (this.memoryApiM.read())
         {
            case StartC:
            {
               if (this.keyValidM)
               {
                  console.log("StartC");
                  this.memoryApiM.setAddress(AddrSwitchesC);
                  this.stateM = "PanelStartWaitAddrE";
                  this.keyValidM = 0;
               }
               break;
            }
            case ContinueC:
            {
               if (this.keyValidM)
               {
                  console.log("ContinueC");
                  this.runningM = 1;
                  this.addressRegM = this.regM[PcRegC];
                  this.memoryApiM.setAddress(this.addressRegM);
                  this.regM[PcRegC] = (this.regM[PcRegC] + 1) & 0xFFFF;
                  this.keyValidM = 0;
                  this.stateM = "DecodeInstrE";
               }
               break;
            }
            case InstStepC:
            {
               if (this.keyValidM)
               {
                  console.log("InstStepC");
                  this.addressRegM = this.regM[PcRegC];
                  this.memoryApiM.setAddress(this.addressRegM);
                  this.regM[PcRegC] = (this.regM[PcRegC] + 1) & 0xFFFF;
                  this.keyValidM = 0;
                  this.stateM = "DecodeInstrE";
               }
               break;
            }
            case ExamineC:
            {
               if (this.keyValidM)
               {
                  console.log("ExamineC");
                  this.memoryApiM.setAddress(AddrSwitchesC);
                  this.stateM = "PanelExamineWaitAddrE";
                  this.keyValidM = 0;
               }
               break;
            }
            case ExamineNextC:
            {
               if (this.keyValidM)
               {
                   console.log("ExamineNextC");
                   this.stateM = "PanelExamineWaitNextE";
                   this.keyValidM = 0;
               }
               break;
            }
            case ExamineRegisterC:
            {
               if (this.keyValidM)
               {
                   console.log("ExamineRegisterC");
                   this.memoryApiM.setAddress(RegSwitchesC);
                   this.stateM = "PanelExamineRegWaitRegE";
                   this.keyValidM = 0;
               }
               break;
            }
            case DepositC:
            {
               if (this.keyValidM)
               {
                  console.log("DepositC");
                  this.memoryApiM.setAddress(AddrSwitchesC);
                  this.stateM = "PanelDepositWaitDataE";
                  this.keyValidM = 0;
               }
               break;
            }
            case DepositNextC:
            {
               if (this.keyValidM)
               {
                  console.log("DepositNextC");
                  this.memoryApiM.setAddress(AddrSwitchesC);
                  this.stateM = "PanelDepositWaitNextE";
                  this.keyValidM = 0;
               }
               break;
            }
            case DepositRegisterC:
            {
               if (this.keyValidM)
               {
                  console.log("DepositRegisterC");
                  this.memoryApiM.setAddress(RegSwitchesC);
                  this.stateM = "PanelDepositRegWaitRegE";
                  this.keyValidM = 0;
               }
               break;
            }
            default:
            {
               this.stateM = "StoppedE";
               this.keyValidM = 1;
               break;
            }
         }
         break;
      }
      case "PanelStartWaitAddrE":
      {
         this.runningM = 1;
         var dataIn = this.memoryApiM.read();
         this.regM[PcRegC] = dataIn;
         this.memoryApiM.setAddress(dataIn);
         this.regM[PcRegC] = (this.regM[PcRegC] + 1) & 0xFFFF
         this.stateM = "DecodeInstrE";
         break;
      }
      case "PanelExamineWaitAddrE":
      {
         var dataIn = this.memoryApiM.read();
         this.regM[PcRegC] = dataIn;
         this.memoryApiM.setAddress(dataIn);
         this.stateM = "PanelWaitDataE";
         break;
      }
      case "PanelExamineWaitNextE":
      {
         this.regM[PcRegC] = (this.regM[PcRegC] + 1) & 0xFFFF;
         this.memoryApiM.setAddress(this.regM[PcRegC]);
         this.stateM = "PanelWaitDataE";
         break;
      }
      case "PanelDepositWaitDataE":
      {
         this.stateM = "PanelDepositWriteDataE";
         break;
      }
      case "PanelDepositWriteDataE":
      {
         var dataIn = this.memoryApiM.read();
         this.memoryApiM.setAddress(this.regM[PcRegC]);
         this.memoryApiM.write(dataIn);
         this.stateM = "PanelFetchDataE";
         break;
      }
      case "PanelDepositWaitNextE":
      {
         this.regM[PcRegC] = (this.regM[PcRegC] + 1) & 0xFFFF;
         this.stateM = "PanelDepositWriteDataE";
         break;
      }
      case "PanelDepositWaitWriteMemE":
      {
         this.stateM = "StoppedE"; // ??????
         break;
      }
      case "PanelExamineRegWaitRegE":
      {
         this.stateM = "PanelShowRegE";
         break;
      }
      case "PanelDepositRegWaitRegE":
      {
         this.stateM = "PanelDepositRegFetchDataE";
         break;
      }
      case "PanelDepositRegFetchDataE":
      {
         this.registerIndexM = this.memoryApiM.read() & 0x0007;
         this.memoryApiM.setAddress(AddrSwitchesC);
         this.stateM = "PanelDepositRegWaitDataE";
         break;
      }
      case "PanelDepositRegWaitDataE":
      {
          this.stateM = "PanelDepositRegWriteDataE";
          break
      }
      case "PanelDepositRegWriteDataE":
      {
         var dataOut =  this.memoryApiM.read();
         this.regM[this.registerIndexM] = dataOut;
         this.memoryApiM.setAddress(DataLedsC);
         this.stateM = "PanelShowAddrE";
         break;
      }
      case "PanelShowRegE":
      {
         var dataIn = this.memoryApiM.read();
         this.memoryApiM.setAddress(DataLedsC);
         this.memoryApiM.write(this.regM[dataIn]);
         this.stateM = "PanelShowAddrE";
         break;
      }
      case "PanelFetchDataE":
      {
         this.memoryApiM.setAddress(this.regM[PcRegC]);
         this.stateM = "PanelWaitDataE";
         break;
      }
      case "PanelWaitDataE":
      {
         this.stateM = "PanelShowDataE";
         break;
      }
      case "PanelShowDataE":
      {
         var dataIn = this.memoryApiM.read();
         this.memoryApiM.setAddress(DataLedsC);
         this.memoryApiM.write(dataIn);
         this.stateM = "PanelShowAddrE";
         break;
      }
      case "PanelShowAddrE":
      {
         this.memoryApiM.setAddress(AddrLedsC);
         this.memoryApiM.write(this.regM[PcRegC]);
         this.stateM = "StoppedE";
         break;
      }
   }
}

// ----------------------------------------------------------------------------

K16Cpu.prototype.decodeStoreInstruction = function ()
{
   var rAddress = (this.instructionM >> 7) & 0x007; 
   var address = this.regM[rAddress];
   var offset = this.instructionM & 0x007F;
   if (offset & 0x0040)
   {
      // Negative offset - copy sign to most significant bits
      offset |= 0xFF80;
   }
   this.addressRegM = address + offset;
   this.memoryApiM.setAddress(this.addressRegM);
   this.stateM = "WaitWriteMemE";
}

// ----------------------------------------------------------------------------

K16Cpu.prototype.readMemReady = function ()
{
   var rDest = (this.instructionM >> 10) & 0x007; 
   this.regM[rDest] = this.memoryApiM.read();
   this.setZeroAndNegativeFlag(this.regM[rDest]);
   
   this.stateM = "FetchInstrE";   
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.writeMemReady = function ()
{
   var rDest = (this.instructionM >> 10) & 0x007; 
   this.memoryApiM.write(this.regM[rDest]);
   this.stateM = "FetchInstrE";   
}

// ----------------------------------------------------------------------------

K16Cpu.prototype.writeReturnAddressReady = function ()
{
   this.memoryApiM.write(this.regM[PcRegC]);
   var rAddress = (this.instructionM >> 10) & 0x007; 
   var address = this.regM[rAddress];
   var offset = this.instructionM & 0x03FF;
   if (offset & 0x0200)
   {
      // Negative offset - copy sign to most significant bits
      offset |= 0xFC00;
   }
   this.regM[PcRegC] = (address + offset) & 0xFFFF;
   this.stateM = "FetchInstrE";   
}

// ----------------------------------------------------------------------------

K16Cpu.prototype.reset = function ()
{
   for (var i = 0; i < NumRegsC; i++)
   {
      this.regM[i] = 0;
   }
   this.addressRegM = 0;
   this.instructionM = 0;
   this.flagsM = { carry: 0, zero: 0, negative: 0, overflow: 0 };
   this.stateM = "PanelFetchDataE";
   this.tickCountM = 0;
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.setZeroAndNegativeFlag = function (theResult)
{
   this.flagsM.zero = (theResult == 0 ? 1 : 0);
   this.flagsM.negative = (theResult & 0x8000 ? 1 : 0);
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.setCarryAndOverflowFlag = function (theTempResult, theSrc1, theSrc2)
{
   var result = theTempResult & 0xFFFF;
   var resultNegative = result & 0x8000;
   var src1Negative = theSrc1 & 0x8000;
   var src2Negative = theSrc2 & 0x8000;
   this.flagsM.carry = (theTempResult & 0x10000 ? 1 : 0);
   this.flagsM.overflow = (  src1Negative &    src2Negative  & (~resultNegative)) ||
                          ((~src1Negative) & ~(src2Negative) &   resultNegative);
};

// ----------------------------------------------------------------------------

K16Cpu.prototype.stop = function ()
{
   this.runningM = false;
}

