function K16Memory(theFrameBuffer, theIoModule)
{
   this.addressM = 0;
   this.frameBufferM = theFrameBuffer;
   this.ioModuleM = theIoModule;
   this.memoryM = [];
   this.memoryM.fill(0, 0, 0x03FF);
  
   this.memoryM[0] = 0x7b01; //                LDHZ SP 0x01 ; Set SP to 0x0100
   this.memoryM[1] = 0x7300; // Start:         LDHZ R4 0x00 
   this.memoryM[2] = 0x6dff; //                LDH R3 $IoCntrLo.H
   this.memoryM[3] = 0x6cfd; //                LDL R3 $IoCntrLo.L
   this.memoryM[4] = 0xc980; //                LD  R2 [R3]
   this.memoryM[5] = 0x6201; //                LDLZ R0 1
   this.memoryM[6] = 0x6604; //                LDLZ R1 4
   this.memoryM[7] = 0xbc0b; //                JSR DisplayReg
   this.memoryM[8] = 0x6cfe; //                LDL R3 $IoCntrHi.L
   this.memoryM[9] = 0xc980; //                LD R2 [R3]
   this.memoryM[10] = 0x6201; //                LDLZ R0 1
   this.memoryM[11] = 0x6605; //                LDLZ R1 5
   this.memoryM[12] = 0xbc06; //                JSR DisplayReg
   this.memoryM[13] = 0x0a08; //                LD R2 R4
   this.memoryM[14] = 0x6201; //                LDLZ R0 1
   this.memoryM[15] = 0x6607; //                LDLZ R1 7
   this.memoryM[16] = 0xbc02; //                JSR DisplayReg
   this.memoryM[17] = 0x120c; //                INC R4 R4
   this.memoryM[18] = 0x9fee; //                JMP Start
                   // 
                   // ; Display the value of R2 in hexadecimal format at screen column R0, and row R1
                   // ; [in]   R0 = column
                   // ; [in]   R1 = row
                   // ; [in]   R2 = reg
   this.memoryM[19] = 0x2c0c; // DisplayReg:    PSH R3
   this.memoryM[20] = 0x300c; //                PSH R4
   this.memoryM[21] = 0x340c; //                PSH R5
   this.memoryM[22] = 0xbc1a; //                JSR GetCursorPos
   this.memoryM[23] = 0x720f; //                LDLZ R4 0x0F
   this.memoryM[24] = 0x090b; //                SWP R2 R2
   this.memoryM[25] = 0x0d09; //                LDL R3 R2
   this.memoryM[26] = 0x2d80; //                SHR R3 R3
   this.memoryM[27] = 0x2d80; //                SHR R3 R3
   this.memoryM[28] = 0x2d80; //                SHR R3 R3
   this.memoryM[29] = 0x2d80; //                SHR R3 R3
   this.memoryM[30] = 0x0dc4; //                AND R3 R3 R4
   this.memoryM[31] = 0xbc1e; //               JSR WriteHexDigit
   this.memoryM[32] = 0x0d09; //                LDL R3 R2
   this.memoryM[33] = 0x0dc4; //                AND R3 R3 R4
   this.memoryM[34] = 0xbc1b; //                JSR WriteHexDigit
   this.memoryM[35] = 0x090b; //                SWP R2 R2
   this.memoryM[36] = 0x0d09; //                LDL R3 R2
   this.memoryM[37] = 0x2d80; //                SHR R3 R3
   this.memoryM[38] = 0x2d80; //                SHR R3 R3
   this.memoryM[39] = 0x2d80; //                SHR R3 R3
   this.memoryM[40] = 0x2d80; //                SHR R3 R3
   this.memoryM[41] = 0x0dc4; //                AND R3 R3 R4
   this.memoryM[42] = 0xbc13; //               JSR WriteHexDigit
   this.memoryM[43] = 0x0d09; //                LDL R3 R2
   this.memoryM[44] = 0x0dc4; //                AND R3 R3 R4
   this.memoryM[45] = 0xbc10; //                JSR WriteHexDigit
   this.memoryM[46] = 0x340d; //                POP R5
   this.memoryM[47] = 0x300d; //                POP R4
   this.memoryM[48] = 0x2c0d; //                POP R3
                   // 
                   // ; Get the address of screen column R0, row R1 
                   // ; [in]   R0 = column
                   // ; [in]   R1 = row
                   // ; [out]  R5 = position 
   this.memoryM[49] = 0x2c0c; // GetCursorPos:  PSH R3
   this.memoryM[50] = 0x7780; //                LDHZ R5 $FrameBuf.H
   this.memoryM[51] = 0x0c88; //                LD R3  R1 ; Multiply row by 40 
   this.memoryM[52] = 0x2d81; //                SHL R3 R3
   this.memoryM[53] = 0x2d81; //                SHL R3 R3
   this.memoryM[54] = 0x2d81; //                SHL R3 R3
   this.memoryM[55] = 0x16b0; //                ADD R5 R5 R3
   this.memoryM[56] = 0x2d81; //                SHL R3 R3
   this.memoryM[57] = 0x2d81; //                SHL R3 R3
   this.memoryM[58] = 0x16b0; //                ADD R5 R5 R3
   this.memoryM[59] = 0x1680; //                ADD R5 R5 R0 ; Add column
   this.memoryM[60] = 0x2c0d; //                POP R3
   this.memoryM[61] = 0x3c0d; //                RET
                   // 
                   // ; Write hex digit R3 at position R5 to screen
                   // ; [in]   R5 = pos
                   // ; [in]   R3 = hex digit
   this.memoryM[62] = 0x300c; // WriteHexDigit: PSH R4
   this.memoryM[63] = 0x720a; //                LDLZ R4 10
   this.memoryM[64] = 0x01ce; //                CMP R3 R4
   this.memoryM[65] = 0x4783; //                BCC NotDecimal
   this.memoryM[66] = 0x7230; //                LDLZ R4 '0'
   this.memoryM[67] = 0x0dc0; //                ADD R3 R3 R4
   this.memoryM[68] = 0x9c02; //                JMP StoreDigit
   this.memoryM[69] = 0x7237; // NotDecimal:    LDLZ R4 'A' - 10
   this.memoryM[70] = 0x0dc0; //                ADD R3 R3 R4
   this.memoryM[71] = 0x6d3c; // StoreDigit:    LDH R3 $BgWhite | $Red; White background red text
   this.memoryM[72] = 0xee80; //                STO R3 [R5] 
   this.memoryM[73] = 0x168c; //                INC R5 R5
   this.memoryM[74] = 0x300d; //                POP R4
   this.memoryM[75] = 0x3c0d; //                RET
}

// ----------------------------------------------------------------------------

K16Memory.prototype.setAddress = function (theAddress)
{
   this.addressM = theAddress;
};

// ----------------------------------------------------------------------------

K16Memory.prototype.read = function ()
{
   if ((this.addressM & 0xFC00) == 0x0000)
   {
      // RAM 
      var address = this.addressM & 0x03FF;
      return this.memoryM[address];
   }
   
   if ((this.addressM & 0xF800) == 0x8000)
   {
      // frame buffer
      var address = this.addressM & 0x07FF;
      return this.frameBufferM[address];
   }
   
   if ((this.addressM & 0xFFF8) == 0xFFF8)
   {
      // IO 
      var address = this.addressM & 0x0007;
      return this.ioModuleM.read(address);
   }
   
   return 0xBAD1;
};

// ----------------------------------------------------------------------------

K16Memory.prototype.write = function (theData)
{
   if ((this.addressM & 0xFC00) == 0x0000)
   {
      // RAM 
      var address = this.addressM & 0x03FF;
      this.memoryM[address] = theData;
      return;
   }
   
   if ((this.addressM & 0xF800) == 0x8000)
   {
      // frame buffer
      var address = this.addressM & 0x07FF;
      this.frameBufferM[address] = theData;
      return;
   }
   
   if ((this.addressM & 0xFFF8) == 0xFFF8)
   {
      // IO 
      var address = this.addressM & 0x0007;
      this.ioModuleM.write(address, theData);
      return;
   }
};

