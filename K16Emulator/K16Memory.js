function K16Memory(theFrameBuffer, theIoModule)
{
   this.addressM = 0;
   this.frameBufferM = theFrameBuffer;
   this.ioModuleM = theIoModule;
   this.memoryM = [];
   this.memoryM.fill(0, 0, 0x03FF);
   
   this.memoryM[0] =  0x7300; //        LDHZ R4 0x00
   this.memoryM[1] =  0x7B01; // Start: LDHZ SP 0x01
   this.memoryM[2] =  0x6DFF; //        LDH R3 0xFF
   this.memoryM[3] =  0x6CFD; //        LDL R3 0xFD
   this.memoryM[4] =  0xC980; //        LD  R2 [R3]
   this.memoryM[5] =  0x6201; //        LDLZ R0 1
   this.memoryM[6] =  0x6604; //        LDLZ R1 4
   this.memoryM[7] =  0xBC0B; //        JSR DisplayReg
   this.memoryM[8] =  0x6CFE; //        LDL R3 0xFE
   this.memoryM[9] =  0xC980; //        LD R2 [R3]
   this.memoryM[10] =  0x6201; //        LDLZ R0 1
   this.memoryM[11] =  0x6605; //        LDLZ R1 5
   this.memoryM[12] =  0xBC06; //        JSR DisplayReg
   this.memoryM[13] =  0x0A08; //        LD R2 R4
   this.memoryM[14] =  0x6201; //        LDLZ R0 1
   this.memoryM[15] =  0x6607; //        LDLZ R1 7
   this.memoryM[16] =  0xBC02; //        JSR DisplayReg
   this.memoryM[17] =  0x120C; //        INC R4 R4
   this.memoryM[18] =  0x9FEE; //        JMP Start
   this.memoryM[19] =  0x2C0C; // DisplayReg:   PSH R3
   this.memoryM[20] =  0x300C; //               PSH R4
   this.memoryM[21] =  0x340C; //               PSH R5
   this.memoryM[22] =  0xBC16; //               JSR GetCursorPos
   this.memoryM[23] =  0x720F; //               LDLZ R4 0x0F
   this.memoryM[24] =  0x0D0A; //               LDH R3 R2
   this.memoryM[25] =  0x2D80; //               SHR R3 R3
   this.memoryM[26] =  0x2D80; //               SHR R3 R3
   this.memoryM[27] =  0x2D80; //               SHR R3 R3
   this.memoryM[28] =  0x2D80; //               SHR R3 R3
   this.memoryM[29] =  0xBC1C; //               JSR WriteHexDigit
   this.memoryM[30] =  0x0D0A; //               LDH R3 R2
   this.memoryM[31] =  0x0DC4; //               AND R3 R3 R4
   this.memoryM[32] =  0xBC19; //               JSR WriteHexDigit
   this.memoryM[33] =  0x0D09; //               LDL R3 R2
   this.memoryM[34] =  0x2D80; //               SHR R3 R3
   this.memoryM[35] =  0x2D80; //               SHR R3 R3
   this.memoryM[36] =  0x2D80; //               SHR R3 R3
   this.memoryM[37] =  0x2D80; //               SHR R3 R3
   this.memoryM[38] =  0xBC13; //               JSR WriteHexDigit
   this.memoryM[39] =  0x0D09; //               LDL R3 R2
   this.memoryM[40] =  0x0DC4; //               AND R3 R3 R4
   this.memoryM[41] =  0xBC10; //               JSR WriteHexDigit
   this.memoryM[42] =  0x340D; //               POP R5
   this.memoryM[43] =  0x300D; //               POP R4
   this.memoryM[44] =  0x2C0D; //               POP R3
   this.memoryM[45] =  0x2C0C; // GetCursorPos: PSH R3
   this.memoryM[46] =  0x7780; //               LDHZ R5 0x80
   this.memoryM[47] =  0x0C88; //               LD R3  R1 ; Multiply row by 40
   this.memoryM[48] =  0x2D81; //               SHL R3 R3
   this.memoryM[49] =  0x2D81; //               SHL R3 R3
   this.memoryM[50] =  0x2D81; //               SHL R3 R3
   this.memoryM[51] =  0x16B0; //               ADD R5 R5 R3
   this.memoryM[52] =  0x2D81; //               SHL R3 R3
   this.memoryM[53] =  0x2D81; //               SHL R3 R3
   this.memoryM[54] =  0x16B0; //               ADD R5 R5 R3
   this.memoryM[55] =  0x1680; //               ADD R5 R5 R0 ; Add column
   this.memoryM[56] =  0x2C0D; //               POP R3
   this.memoryM[57] =  0x3C0D; //               RET
   this.memoryM[58] =  0x300C; // WriteHexDigit: PSH R4
   this.memoryM[59] =  0x720A; //                LDLZ R4 10
   this.memoryM[60] =  0x01CE; //                CMP R3 R4
   this.memoryM[61] =  0x4783; //                BCC NotDecimal
   this.memoryM[62] =  0x7230; //                LDLZ R4 48 ; '0'
   this.memoryM[63] =  0x0DC0; //                ADD R3 R3 R4
   this.memoryM[64] =  0x9C02; //                JMP StoreDigit
   this.memoryM[65] =  0x7237; // NotDecimal:    LDLZ R4 55 ; 'A' - 10
   this.memoryM[66] =  0x0DC0; //                ADD R3 R3 R4
   this.memoryM[67] =  0x6D3C; // StoreDigit:    LDH R3 0x3C; White background red text
   this.memoryM[68] =  0xEE80; //                STO R3 [R5]
   this.memoryM[69] =  0x168C; //                INC R5 R5
   this.memoryM[70] =  0x300D; //                POP R4
   this.memoryM[71] =  0x3C0D; //                RET
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

