function isalnum(theCharacter)
{
   return isalpha(theCharacter) || isdigit(theCharacter);
}

// ----------------------------------------------------------------------------

function isalpha(theCharacter)
{
   return islower(theCharacter) || isupper(theCharacter);
}

// ----------------------------------------------------------------------------

function isblank(theCharacter)
{
   return theCharacter == " "  ||
          theCharacter == "\t";
}

// ----------------------------------------------------------------------------

function isdigit(theCharacter)
{
   return theCharacter >= "0" && theCharacter <= "9";
}

// ----------------------------------------------------------------------------

function islower(theCharacter)
{
   return theCharacter >= "a" && theCharacter <= "z";
}

// ----------------------------------------------------------------------------

function isprint(theCharacter)
{
   return theCharacter >= " " && theCharacter <= "~";
}

// ----------------------------------------------------------------------------

function isspace(theCharacter)
{
   return theCharacter == " "  ||
          theCharacter == "\t" ||
          theCharacter == "\n" ||
          theCharacter == "\v" ||
          theCharacter == "\f" ||
          theCharacter == "\r";
}

// ----------------------------------------------------------------------------

function isupper(theCharacter)
{
   return theCharacter >= "A" && theCharacter <= "Z";
}

// ----------------------------------------------------------------------------

function isxdigit(theCharacter)
{
   return isdigit(theCharacter) || 
          (theCharacter >= "a" && theCharacter <= "f") ||
          (theCharacter >= "A" && theCharacter <= "F");
}

// ----------------------------------------------------------------------------

function K16Opcode(theName)
{
   this.name = theName;
   this.format = [];
}

// ----------------------------------------------------------------------------

K16Opcode.prototype.addFormat = function (theFormat, theCode, theMask)
{
   for (var format in this.format)
   {
      if (format.format == theFormat)
      {
         return false; // Format already exists
      }
   }
   var formatEntry = { format: theFormat, code: theCode, mask: theMask};
   this.format.push(formatEntry);
   return true;
};


// ----------------------------------------------------------------------------

function K16OpcodeTable()
{
   this.opcode = {};
}

// ----------------------------------------------------------------------------

K16OpcodeTable.prototype.addOpcode = function (theName, theFormat, theCode, theMask)
{
   if (theName in this.opcode)
   {
      return this.opcode[theName].addFormat(theFormat, theCode, theMask);
   }
   
   var opcode = new K16Opcode(theName);
   opcode.addFormat(theFormat, theCode, theMask);
   this.opcode[theName] = opcode;
   return true;
};

// ----------------------------------------------------------------------------

K16OpcodeTable.prototype.getOpcode = function (theName)
{
   return this.opcode[theName];
};

// ----------------------------------------------------------------------------

function K16Assembler()
{
   this.constants = {};
   this.currentAddress = 0;
   this.currentChar = 0;
   this.errorMessage = "";
   this.labelMap = {};
   this.code = {};
   this.sourceCode = [];
   this.line = 0;
   this.opcodeTable = new K16OpcodeTable();
   this.opcodeTable.addOpcode("ADD",  "Reg321E",     0x0000, 0xE00F);
   this.opcodeTable.addOpcode("ADC",  "Reg321E",     0x0001, 0xE00F);
   this.opcodeTable.addOpcode("SUB",  "Reg321E",     0x0002, 0xE00F);
   this.opcodeTable.addOpcode("SBC",  "Reg321E",     0x0003, 0xE00F);
   this.opcodeTable.addOpcode("AND",  "Reg321E",     0x0004, 0xE00F);
   this.opcodeTable.addOpcode("OR",   "Reg321E",     0x0005, 0xE00F);
   this.opcodeTable.addOpcode("XOR",  "Reg321E",     0x0006, 0xE00F);
   this.opcodeTable.addOpcode("NOT",  "Reg32E",      0x0007, 0xE00F);
   this.opcodeTable.addOpcode("LD",   "Reg32E",      0x0008, 0xE00F);
   this.opcodeTable.addOpcode("LDL",  "Reg32E",      0x0009, 0xE00F);
   this.opcodeTable.addOpcode("LDH",  "Reg32E",      0x000A, 0xE00F);
   this.opcodeTable.addOpcode("SWP",  "Reg32E",      0x000B, 0xE00F);
   this.opcodeTable.addOpcode("INC",  "Reg32E",      0x000C, 0xE00F);
   this.opcodeTable.addOpcode("CMP",  "Reg21E",      0x000E, 0xE00F);
   this.opcodeTable.addOpcode("DEC",  "Reg32E",      0x000F, 0xE00F);
   this.opcodeTable.addOpcode("SHR",  "Reg32E",      0x2000, 0xE00F);
   this.opcodeTable.addOpcode("SHL",  "Reg32E",      0x2001, 0xE00F);
   this.opcodeTable.addOpcode("ASHL", "Reg32E",      0x2001, 0xE00F); // == SHL
   this.opcodeTable.addOpcode("ASHR", "Reg32E",      0x2002, 0xE00F);
   this.opcodeTable.addOpcode("ROR",  "Reg32E",      0x2003, 0xE00F);
   this.opcodeTable.addOpcode("ROL",  "Reg32E",      0x2004, 0xE00F);
   this.opcodeTable.addOpcode("CLC",  "NoArgE",      0x2008, 0xE00F);
   this.opcodeTable.addOpcode("SEC",  "NoArgE",      0x2009, 0xE00F);
   this.opcodeTable.addOpcode("CLI",  "NoArgE",      0x200A, 0xE00F);
   this.opcodeTable.addOpcode("SEC",  "NoArgE",      0x200B, 0xE00F);
   this.opcodeTable.addOpcode("PSH",  "Reg3E",       0x200C, 0xE00F);
   this.opcodeTable.addOpcode("POP",  "Reg3E",       0x200D, 0xE00F); // R3 != PC
   this.opcodeTable.addOpcode("RET",  "NoArgE",      0x3C0D, 0xFFFF); // R3 == PC
   this.opcodeTable.addOpcode("RTI",  "Reg3E",       0x200E, 0xE00F); 
   this.opcodeTable.addOpcode("BCS",  "Reg2Offs7E",  0x4000, 0xFC00);
   this.opcodeTable.addOpcode("BCC",  "Reg2Offs7E",  0x4400, 0xFC00);
   this.opcodeTable.addOpcode("BZS",  "Reg2Offs7E",  0x4800, 0xFC00);
   this.opcodeTable.addOpcode("BZC",  "Reg2Offs7E",  0x4C00, 0xFC00);
   this.opcodeTable.addOpcode("BNS",  "Reg2Offs7E",  0x5000, 0xFC00);
   this.opcodeTable.addOpcode("BNC",  "Reg2Offs7E",  0x5400, 0xFC00);
   this.opcodeTable.addOpcode("BOS",  "Reg2Offs7E",  0x5800, 0xFC00);
   this.opcodeTable.addOpcode("BOC",  "Reg2Offs7E",  0x5C00, 0xFC00);
   this.opcodeTable.addOpcode("LDL",  "Reg3Imm8E",   0x6000, 0xE300);
   this.opcodeTable.addOpcode("LDH",  "Reg3Imm8E",   0x6100, 0xE300);
   this.opcodeTable.addOpcode("LDLZ", "Reg3Imm8E",   0x6200, 0xE300);
   this.opcodeTable.addOpcode("LDHZ", "Reg3Imm8E",   0x6300, 0xE300);
   this.opcodeTable.addOpcode("LDHZ", "Reg3Imm8E",   0x6300, 0xE300);
   this.opcodeTable.addOpcode("JMP",  "Reg3Offs10E", 0x8000, 0xE000);
   this.opcodeTable.addOpcode("JSR",  "Reg3Offs10E", 0xA000, 0xE000);
   this.opcodeTable.addOpcode("LD",   "Reg32Offs7E", 0xC000, 0xE000);
   this.opcodeTable.addOpcode("STO",  "Reg32Offs7E", 0xE000, 0xE000);
   this.opcodeTable.addOpcode("HLT",  "NoArgE",      0x9FFF, 0xFFFF);
}

// ----------------------------------------------------------------------------

K16Assembler.prototype.encodeImm8 = function (theCode, theImm8)
{
   return (theCode & ~0x00FF) | (theImm8 & 0x00FF);
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.encodeOffs7 = function (theCode, theOffs7)
{
   return (theCode & ~0x007F) | (theOffs7 & 0x007F);
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.encodeOffs10 = function (theCode, theOffs10)
{
   return (theCode & ~0x03FF) | (theOffs10 & 0x03FF);
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.encodeRegister1 = function (theCode, theRegister)
{
   return (theCode & ~0x0070) | ((theRegister << 4) & 0x0070);
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.encodeRegister2 = function (theCode, theRegister)
{
   return (theCode & ~0x0380) | ((theRegister << 7) & 0x0380);
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.encodeRegister3 =function (theCode, theRegister)
{
   return (theCode & ~0x1C00) | ((theRegister << 10) & 0x1C00);
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.getCurrentChar = function ()
{
   return this.currentChar < this.assemblyCode.length ? 
          this.assemblyCode.charAt(this.currentChar) :
          undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.getCurrentCharCode = function ()
{
   return this.currentChar < this.assemblyCode.length ? 
          this.assemblyCode.charCodeAt(this.currentChar) :
          undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.getSourceAtAddress = function (theAddress)
{
   for (var i = 0; i < this.sourceCode.length; i++)
   {
      var source = this.sourceCode[i];
      if (source && source.address == theAddress)
      {
         return this.sourceCode[i].sourceCode;
      }
   }
   return undefined;
}

// ----------------------------------------------------------------------------

K16Assembler.prototype.getOffset = function (theLabel, theMask)
{
   if (theLabel in this.labelMap)
   {
      // Label found
      var label = this.labelMap[theLabel];
      var offset = this.offsetFromLabel(label, this.currentAddress, theMask);
      if (offset == undefined)
      {
         return undefined;
      }
      return offset;
   }
   else
   {
      // Label not found
      return undefined;
   }
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.findLabel = function (theLabel)
{
   if (theLabel in this.labelMap)
   {
      // Label found
      return this.labelMap[theLabel].address;
   }
   else
   {
      // Label not found
      return undefined;
   }
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.identifierToOpcode = function (theIdentifier)
{
   return this.opcodeTable.getOpcode(theIdentifier);
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.isEndOfLine = function ()
{
   this.skipSpaces();
   if (this.getCurrentChar() == ';'       || 
       this.getCurrentChar() == undefined ||
       this.getCurrentChar() == '\r'      ||
       this.getCurrentChar() == '\n')
   { 
      while (this.getCurrentChar() != '\n')
      {
         if (this.getCurrentChar() == undefined)
         {
            return true;
         }
         this.nextChar();
         if (this.getCurrentChar() == undefined)
         {
            return true;
         }
      }
      this.nextChar();
      return true;
   }
   return false;
}

// ----------------------------------------------------------------------------

K16Assembler.prototype.nextChar = function ()
{
   if (this.currentChar < this.assemblyCode.length)
   {
      if (this.getCurrentChar() == '\n')
      {
         this.line++;
      }
      this.currentChar++;
   }
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.offsetFromLabel = function (theLabel, theAddress, theMask)
{
   var offset = theLabel.address - (theAddress + 1);
   var notMask = ~theMask;
   var extra = offset & notMask;
   if (offset & 0x8000)
   {
      // Negative offset
      if (extra != notMask)
      {
         this.errorMessage = "Label \"" + theLabel.name + 
                             "\" is too far from caller at address " + 
                             theLabel.address + ".";
         return undefined;
      }
   }
   else
   {
      // Positive offset
      if (extra != 0)
      {
         this.errorMessage = "Label \"" + theLabel.name + 
                             "\" is too far from caller at address " + 
                             theLabel.addres + ".";
         return undefined;
      }
   }
   return offset & theMask;
}

// ----------------------------------------------------------------------------

K16Assembler.prototype.parse = function (theAssemblyCode)
{
   if (theAssemblyCode.charAt(theAssemblyCode.length - 1) == "\n")
   {
      this.assemblyCode = theAssemblyCode;
   }
   else
   {
      this.assemblyCode = theAssemblyCode + "\n";
   }

   // First pass: Check syntax and store labels   
   this.finalPass = false;
   this.currentAddress = 0;
   this.currentChar = 0;
   this.errorMessage == "";
   this.line = 1;
   
   while (this.getCurrentChar() != undefined)
   {
      if (this.parseLine() == false)
      {
         return false;
      }
   }
   
   // Second pass: Generate final code   
   this.finalPass = true;
   this.currentAddress = 0;
   this.currentChar = 0;
   this.errorMessage == "";
   this.line = 1;
   
   while (this.getCurrentChar() != undefined)
   {
      if (this.parseLine() == false)
      {
         return false;
      }
   }
   return true;
}

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseAddress = function (theOffsetMask)
{
   var registerPresent = true;
   var offsetPresent = true;
   var result = {};
   if (this.getCurrentChar() != '[')
   {
      // Parse label
      var identifier = this.parseIdentifier();
      if (identifier != undefined)
      {
         result.offset = this.getOffset(identifier, theOffsetMask);
         if (result.offset != undefined)
         {
            result.register = PcRegC;
            return result;
         }
         else
         {
            if (this.finalPass == true)
            {
               this.errorMessage = "Label \"" + identifier + "\" is undefined.";
               return;
            }
            result.offset = 0;
            result.register = PcRegC;
            return result;
         }
      }
      this.errorMessage = "Address ('[' R_base(opt) +-offset(opt) ']' or Label) expected.";
      return;
   }

   // Parse '[' R_base(opt) Offset(opt) ']'
   this.nextChar(); // Eat '['
   this.skipSpaces();

   result.register = this.parseRegister();
   if (result.register == undefined)
   {
      result.register = PcRegC;
      registerPresent = false;
   }
   this.skipSpaces();
   
   result.offset = this.parseOffset(theOffsetMask);
   if (result.offset == undefined)
   {
      result.offset = 0;
      offsetPresent = false;
   }
   this.skipSpaces();
   if (this.getCurrentChar() != ']')
   {
      this.errorMessage = "']' expected.";
      return false;
   }
   this.nextChar(); // Eat ']'
   if (registerPresent || offsetPresent)
   {
      return result;
   }
   else
   {
      this.errorMessage = "Address ('[' R_base(opt) +-offset(opt) ']' or Label) expected.";
      return undefined;
   }
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseArguments = function (theOpcode)
{
   for (var i = 0; i < theOpcode.format.length; i++)
   {
      var parsePointer = this.currentChar;
      var format = theOpcode.format[i];
      var code = format.code;
      switch (format.format)
      {
         case "NoArgE":      // E.g. CLI
         {
            if (this.isEndOfLine() == true)
            {
               return code;
            }
            this.errorMessage = "\"" + theOpcode.name + "\" must not have arguments.";
            break;
         }
         case "Reg3E":       // E.g. PSH R0
         {
            code = this.parseReg3(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         case "Reg3Imm8E":   // E.g. LDL R4 0xF2
         {
            code = this.parseReg3Imm8(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         case "Reg2Offs7E":  // E.g. BCS R2 -56 or BCS R3 or BCS +56
         {
            code = this.parseReg2Offs7(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         case "Reg3Offs10E": // E.g. JMP R5 +10 or JMP R4 or JMP +100
         {
            code = this.parseReg3Offs10(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         case "Reg21E":      // E.g. CMP R2 R3
         {
            code = this.parseReg21(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         case "Reg32E":      // E.g. SHR R3 R2
         {
            code = this.parseReg32(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         case "Reg321E":     // E.g. ADD R3 R2 R1
         {
            var code = this.parseReg321(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         case "Reg32Offs7E": // E.g. LD R3 [R2 +60] or STO R3 [R2] or LD R3 [+60]
         {
            var code = this.parseReg32Offs7(code);
            if (code != undefined)
            {
               return code;
            }
            break;
         }
         default:
         {
            break;
         }
      }
      this.currentChar = parsePointer;
   }
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseBinNumber = function (theNumber)
{
   if (this.getCurrentChar() == '0' || 
       this.getCurrentChar() == '1' || 
       this.getCurrentChar() == '_')
   {
      while (true)
      {
         switch (this.getCurrentChar())
         {
            case '0':
            {
               theNumber <<= 1;
               break;
            }
            case '1':
            {
               theNumber <<= 1;
               theNumber |= 1;
               break;
            }
            case '_':
            {
               break;
            }
            default:
            {
               return theNumber;
            }
            this.nextChar(); // Eat digit
         }
      }
   }
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseConstant = function ()
{
   if (this.getCurrentChar() == "$")
   {
      var identifier = this.getCurrentChar();
      this.nextChar(); // Eat first character   
      if (this.getCurrentChar() == "$")
      {
         identifier += this.getCurrentChar();
         this.nextChar(); // Eat character
         return identifier;
      }
      while (isalnum(this.getCurrentChar()) || this.getCurrentChar() == '_')
      {
         identifier += this.getCurrentChar();
         this.nextChar(); // Eat character
      }
      return identifier;
   }
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseDecimalNumber = function (theNumber)
{
   while (isdigit(this.getCurrentChar()))
   {
      theNumber = theNumber * 10 + this.getCurrentCharCode() - '0'.charCodeAt(0);
      this.nextChar(); // Eat digit
   }
   return theNumber;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseDirective = function (theStartOfLine)
{
   var startOfLine = this.currentChar - 1; // Include '.'
   var directive = this.parseIdentifier();
   var firstAddress = this.currentAddress;
   if (directive == undefined)
   {
      return false;
   }
   this.skipSpaces();
   if (directive == "data")
   {
      var startAddress = this.currentAddress;
      while (true)
      {
         var number = this.parseExpression();
         if (number == undefined)
         {
            return false;
         }
         if (number > 0xFFFF)
         {
            this.errorMessage = "Number is larger than machineword.";
            return false;
         }
         this.skipSpaces();
         this.code[this.currentAddress++] = number & 0xFFFF;
         var c = this.getCurrentChar();
         if (c != ',')
         {
            break;
         }
         this.nextChar();
         this.skipSpaces();
      } 
      if (this.isEndOfLine() == false)
      {
         this.errorMessage = "Data, comment, or end-of-line expected.";
         return false;
      }
      this.sourceCode[this.line - 1] = 
      { 
         sourceCode: this.assemblyCode.substring(startOfLine, this.currentChar),
         address:    startAddress,
         length:     this.currentAddress - startAddress
      }
   }
   else
   if (directive == "define")
   {
      var name = this.parseConstant();
      if (name == undefined || name == "$$")
      {
         this.errorMessage = "Identifier expected.";
         return false;
      }
      this.skipSpaces();
      var number = this.parseExpression();
      if (number == undefined)
      {
         this.errorMessage = "Expression expected.";
         return false;
      }
      
      if (this.isEndOfLine() == false)
      {
         this.errorMessage = "Comment, or end-of-line expected.";
         return false;
      }

      if (this.firstPass == true)
      {
         if (name in this.constants)
         {
            this.errorMessage = "Identifier \"" + name + "\" is already defined.";
            return false;
         }
      }

      this.constants[name] = number;

      this.sourceCode[this.line - 1] = 
      { 
         sourceCode: this.assemblyCode.substring(startOfLine, this.currentChar),
         address:    undefined
      }
      return true;
   }
   else
   if (directive == "org")
   {
      var number = this.parseExpression();
      if (number == undefined)
      {
         this.errorMessage = "Expression expected.";
         return false;
      }
      if (number < this.currentAddress)
      {
         this.errorMessage = "Address cannot be smaller than current address.";
         return false;
         
      }
      this.currentAddress = number;
      if (this.isEndOfLine() == false)
      {
         this.errorMessage = "Data, comment, or end-of-line expected.";
         return false;
      }
      this.sourceCode[this.line - 1] = 
      { 
         sourceCode: this.assemblyCode.substring(startOfLine, this.currentChar),
         address:    undefined
      }
      return true;
   }
   else 
   if (directive == "string")
   {
      var startAddress = this.currentAddress;
      var string = this.parseString();
      if (string == undefined)
      {
         return false;
      }
      var numberOfWords = string.length >> 1;
      for (var i = 0; i < numberOfWords; i++)
      {
         var word = (string.charCodeAt(i * 2) << 8) & 0xFF00;
         word |= (string.charCodeAt(i * 2 + 1) & 0x00FF);
         this.code[this.currentAddress++] = word;
      }
      if ((string.length & 0x0001) != 0)
      {
         // Odd length;  
         var word = (string.charCodeAt(string.length - 1) << 8) & 0xFF00;
         this.code[this.currentAddress++] = word;
      }
      else
      {
         // Even length;  
         this.code[this.currentAddress++] = 0x0000;
      }
      if (this.isEndOfLine() == false)
      {
         this.errorMessage = "Comment, or end-of-line expected.";
         return false;
      }
      this.sourceCode[this.line - 1] = 
      { 
         sourceCode: this.assemblyCode.substring(startOfLine, this.currentChar),
         address:    startAddress,
         length:     this.currentAddress - startAddress
      }
   }
   return true;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpression = function ()
{
   
   return this.parseExpressionOr();
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionAdditive = function ()
{
   var lhs = this.parseExpressionMultiplicative();
   if (lhs == undefined)
   {
      return undefined;
   }
   while (true)
   {
      if (this.getCurrentChar() == "+")
      {
         this.skipCharAndSpaces(); // Eat '+'
         var rhs = this.parseExpressionMultiplicative();
         if (rhs == undefined)
         {
            return undefined;
         }
         lhs += rhs;
      }
      else
      if (this.getCurrentChar() == "-")
      {
         this.skipCharAndSpaces(); // Eat '-'
         var rhs = this.parseExpressionMultiplicative();
         if (rhs == undefined)
         {
            return undefined;
         }
         lhs -= rhs;
      }
      else
      {
         break;
      }
   }
   return lhs;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionAnd = function ()
{
   var lhs = this.parseExpressionShift();
   if (lhs == undefined)
   {
      return undefined;
   }
   while (this.getCurrentChar() == "&")
   {
      this.skipCharAndSpaces(); // Eat '&'
      var rhs = this.parseExpressionShift();
      if (rhs == undefined)
      {
         return undefined;
      }
      lhs &= rhs;
   }
   return lhs;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionMember = function ()
{
   var lhs = this.parseExpressionPrimary();
   if (lhs == undefined)
   {
      return undefined;
   }
   while (this.getCurrentChar() == ".")
   {
      this.skipCharAndSpaces(); // Eat '.'
      if (this.getCurrentChar() == "H")
      {
         this.skipCharAndSpaces(); // Eat 'H'
         return (lhs >> 8) & 0xFF;
      }
      else
      if (this.getCurrentChar() == "L")
      {
         this.skipCharAndSpaces(); // Eat 'L'
         return lhs  & 0xFF;
      }
      else
      if (this.getCurrentChar() == "O")
      {
         this.skipCharAndSpaces(); // Eat 'O'
         return lhs  - (this.currentAddress + 1);
      }
      else
      {
         this.errorMessage = "'.H', '.L', or '.O' expected";
         return undefined;
      }
   }
   return lhs;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionMultiplicative = function ()
{
   var lhs = this.parseExpressionUnary();
   if (lhs == undefined)
   {
      return undefined;
   }
   while (true)
   {
      if (this.getCurrentChar() == "*")
      {
         this.skipCharAndSpaces(); // Eat '*'
         var rhs = this.parseExpressionUnary();
         if (rhs == undefined)
         {
            return undefined;
         }
         lhs *= rhs;
      }
      else
      if (this.getCurrentChar() == "/")
      {
         this.skipCharAndSpaces(); // Eat '/'
         var rhs = this.parseExpressionUnary();
         if (rhs == undefined)
         {
            return undefined;
         }
         lhs /= rhs;
      }
      else
      if (this.getCurrentChar() == "%")
      {
         this.skipCharAndSpaces(); // Eat '%'
         var rhs = this.parseExpressionUnary();
         if (rhs == undefined)
         {
            return undefined;
         }
         lhs %= rhs;
      }
      else
      {
         break;
      }
   }
   return lhs;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionOr = function ()
{
   var lhs = this.parseExpressionXor();
   if (lhs == undefined)
   {
      return undefined;
   }
   while (this.getCurrentChar() == "|")
   {
      this.skipCharAndSpaces(); // Eat '|'
      var rhs = this.parseExpressionXor();
      if (rhs == undefined)
      {
         return undefined;
      }
      lhs |= rhs;
   }
   return lhs;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionPrimary = function ()
{
   if (this.getCurrentChar() == "(")
   {
      this.skipCharAndSpaces(); // Eat '('
      var expression = this.parseExpression();
      if (expression == undefined)
      {
         return undefined;
      }
      if (this.getCurrentChar() != ")")
      {
         this.errorMessage = "')' expected. Found '" + this.getCurrentChar() +"'.";
         return undefined;
      }
      this.skipCharAndSpaces(); // Eat ')'
      return expression;
   }
   else
   if (this.getCurrentChar() == "$")
   {
      var constant = this.parseConstant();
      this.skipSpaces();
      if (constant in this.constants)
      {
         return this.constants[constant];
      }         
      else
      if (constant == "$$")
      {
         return this.currentAddress;
      }
      else
      {
         this.errorMessage = "Constant \"" + constant + "\" is undefined.";
         return undefined;
      }
   }
   else
   if (this.getCurrentChar() == "'")
   {
      this.nextChar(); // Skip '
      if (!isprint(this.getCurrentChar()))
      {
         this.errorMessage = "Printable character expected.";
         return undefined;
      }
      result = this.getCurrentChar().charCodeAt(0);
      this.nextChar(); // Skip char
      if (this.getCurrentChar() != "'")
      {
         this.errorMessage = "\"'\" expected.";
         return undefined;
      }
      this.nextChar(); // Skip '
      this.skipSpaces();
      return result;
      
   }
   else
   if (isalpha(this.getCurrentChar()))
   {
      var label = this.parseIdentifier();
      var result = this.findLabel(label, 0xFFFF);
      if (result == undefined)
      {
         if (this.finalPass == true)
         {
            this.errorMessage = "Label \"" + label + "\" is undefined.";
         }
         else
         {
            result = 0;
         }         
      }
      return result;
   }
   else
   {
      var result = this.parseNumber();
      this.skipSpaces();
      return result;
   }
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionShift = function ()
{
   var lhs = this.parseExpressionAdditive();
   if (lhs == undefined)
   {
      return undefined;
   }
   while (true)
   {
      if (this.getCurrentChar() == "<")
      {
         this.nextChar(); // Eat '<'
         if (this.getCurrentChar() != "<")
         {
            this.errorMessage = "'<<' expected";
            return undefined;
         }
         this.skipCharAndSpaces(); // Eat '<'
         var rhs = this.parseExpressionAdditive();
         if (rhs == undefined)
         {
            return undefined;
         }
         lhs <<= rhs;
      }
      else
      if (this.getCurrentChar() == ">")
      {
         this.nextChar(); // Eat '>'
         if (this.getCurrentChar() != ">")
         {
            this.errorMessage = "'>>' expected";
            return undefined;
         }
         this.skipCharAndSpaces(); // Eat '>'
         var rhs = this.parseExpressionAdditive();
         if (rhs == undefined)
         {
            return undefined;
         }
         lhs >>>= rhs;
      }
      else
      {
         break;
      }
   }
   return lhs;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionUnary = function ()
{
   switch (this.getCurrentChar())
   {
      case "+":
      {
         this.skipCharAndSpaces(); // Eat '+'
         return this.parseExpressionUnary();
      }
      case "-":
      {
         this.skipCharAndSpaces(); // Eat '-'
         var rhs = this.parseExpressionUnary();
         if (rhs == undefined)
         {
            return undefined;
         }
         return -rhs;
      }
      case "~":
      {
         this.skipCharAndSpaces(); // Eat '~'
         var rhs = this.parseExpressionUnary();
         if (rhs == undefined)
         {
            return undefined;
         }
         return ~rhs;
      }
      default:
      {
         return this.parseExpressionMember();
      }
   }
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseExpressionXor = function ()
{
   var lhs = this.parseExpressionAnd();
   if (lhs == undefined)
   {
      return undefined;
   }
   while (this.getCurrentChar() == "^")
   {
      this.skipCharAndSpaces(); // Eat '^'
      var rhs = this.parseExpressionAnd();
      if (rhs == undefined)
      {
         return undefined;
      }
      lhs ^= rhs;
   }
   return lhs;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseHexNumber = function (theNumber)
{
   while (isxdigit(this.getCurrentChar()))
   {
      theNumber = theNumber * 16;
      if (isdigit(this.getCurrentChar()))
      {
         theNumber += this.getCurrentCharCode() - '0'.charCodeAt(0);
      }
      else
      if (this.getCurrentChar() >= 'a' && this.getCurrentChar() <= 'f')
      {
         theNumber += 10 + this.getCurrentCharCode() - 'a'.charCodeAt(0);
      }
      else
      if (this.getCurrentChar() >= 'A' && this.getCurrentChar() <= 'F')
      {
         theNumber += 10 + this.getCurrentCharCode() - 'A'.charCodeAt(0);
      }
      this.nextChar(); // Eat hex digit
   }
   return theNumber;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseIdentifier = function ()
{
   if (isalpha(this.getCurrentChar()))
   {
      var identifier = this.getCurrentChar();
      this.nextChar(); // Eat first character   
      while (isalnum(this.getCurrentChar()) || this.getCurrentChar() == '_')
      {
         identifier += this.getCurrentChar();
         this.nextChar(); // Eat character
      }
      return identifier;
   }
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseLine = function ()
{
   var startOfLine = this.currentChar;
   this.skipSpaces();
   if (this.isEndOfLine())
   {
      // Comment or empty line
      this.sourceCode[this.line - 1] = 
      { 
         sourceCode: this.assemblyCode.substring(startOfLine, this.currentChar),
         address:    undefined
      }
      return true;
   }

   if (this.getCurrentChar() == '.')
   {
      this.nextChar(); // Eat '.'
      return this.parseDirective(startOfLine);
   }

   // Parse label or opcode
   var identifier = this.parseIdentifier();
   if (identifier == undefined)
   {
      this.errorMessage = "Opcode, label, comment or empty line expected.";
      return false;
   }

   var opcode = this.opcodeTable.getOpcode(identifier);

   if (opcode == undefined)
   {
      // No opcode, check if this is a label
      this.skipSpaces();
      if (this.getCurrentChar() != ':')
      {
         // Error - this is no label
         this.errorMessage = "Unknown opcode \"" + opcode + "\".";
         return false;
      }

      // Previous identifier was a label
      if (this.storeLabel(identifier) == false)
      {
         return false;
      }

      this.nextChar(); // Eat ':'
      this.skipSpaces();

      if (this.isEndOfLine())
      {
         // Comment or empty line
         return true;
      }

      if (this.getCurrentChar() == '.')
      {
         this.nextChar(); // Eat '.'
         return this.parseDirective(startOfLine);
      }

      // Parse opcode
      identifier = this.parseIdentifier();
      if (identifier == undefined)
      {
         this.errorMessage = "Opcode, comment or empty line expected.";
         return false;
      }

      opcode = this.opcodeTable.getOpcode(identifier);
      if (opcode == undefined)
      {
         this.errorMessage = "Opcode, comment or empty line expected.";
         return false;
      }
   }

   this.skipSpaces();

   var code = this.parseArguments(opcode);
   if (code == undefined)
   {
      return false;
   }
   this.sourceCode[this.line - 1] = 
   { 
      sourceCode: this.assemblyCode.substring(startOfLine, this.currentChar),
      address:    this.currentAddress,
      length:     1
   }
   this.code[this.currentAddress++] = code;
   return true;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseNumber = function ()
{
   if (isdigit(this.getCurrentChar()))
   {
      theNumber = this.getCurrentCharCode() - '0'.charCodeAt(0);
      this.nextChar();
      if (theNumber == 0)
      {
         if (this.getCurrentChar() == 'x')
         {
            this.nextChar();
            return this.parseHexNumber(theNumber);
         }
         else
         if (this.getCurrentChar() == 'b')
         {
            this.nextChar();
            return  this.parseBinNumber(theNumber);
         }
         else
         {
            return this.parseOctalNumber(theNumber);
         }
      }
      else
      {
         return this.parseDecimalNumber(theNumber);
      }
      
   }
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseOctalNumber = function (theNumber)
{
   while (this.getCurrentChar() >= '0' && this.getCurrentChar() <= '7')
   {
      theNumber = theNumber * 8 + this.getCurrentCharCode() - '0'.charCodeAt(0);
      this.nextChar(); // Eat the octal digit
   }
   return theNumber;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseOffset = function (theOffsetMask)
{
   var isNegative;
   if (this.getCurrentChar() == '+')
   {
      isNegative = false;
   }
   else
   if (this.getCurrentChar() == '-')
   {
      isNegative = true;
   }
   else
   {
      return undefined;
   }
   this.nextChar();
   this.skipSpaces();

   var number = this.parseExpression();
   if (number == undefined)
   {
      return undefined;
   }
   if (isNegative)
   {
      // negative offset
      number = (~number + 1); // two's complement
      if ((number & ~theOffsetMask) != ~theOffsetMask)
      {
         return undefined;
      }
   }
   else
   {
      // positve offset
      if ((number & (~theOffsetMask)) != 0)
      {
         return undefined;
      }
   }
   theOffset = number & theOffsetMask;
   return theOffset;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg21 = function (theCode)
{
   var r2 = this.parseRegister();
   if (r2 != undefined)
   {
      this.skipSpaces();
      var r1 = this.parseRegister();
      if (r1 != undefined)
      {
         this.skipSpaces();
         if (this.isEndOfLine() == true)
         {
            theCode = this.encodeRegister2(theCode, r2);
            theCode = this.encodeRegister1(theCode, r1);
            return theCode;
         }
      }
   }
   this.errorMessage = "Arguments R_lhs R_rhs expected.";
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg2Offs7 = function (theCode)
{
   this.skipSpaces();
   var result = this.parseAddress(0x007F);
   if (result != undefined)
   {
      this.skipSpaces();
      if (this.isEndOfLine() == true)
      {
         theCode = this.encodeRegister2(theCode, result.register);
         theCode = this.encodeOffs7(theCode, result.offset);
         return theCode;
      }
   }
   this.errorMessage = "Arguments R_base +-offset expected.";
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg3 = function (theCode)
{
   var r3 = this.parseRegister();
   if (r3 != undefined)
   {
      this.skipSpaces();
      if (this.isEndOfLine() == true)
      {
         theCode = this.encodeRegister3(theCode, r3);
         return theCode;
      }
   }
   this.errorMessage = "R_dest expected.";
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg32 = function (theCode)
{
   var r3 = this.parseRegister();
   if (r3 != undefined)
   {
      this.skipSpaces();
      var r2 = this.parseRegister();
      if (r2 != undefined)
      {
         this.skipSpaces();
         if (this.isEndOfLine() == true)
         {
            theCode = this.encodeRegister3(theCode, r3);
            theCode = this.encodeRegister2(theCode, r2);
            return theCode;
         }
      }
   }
   this.errorMessage = "Arguments R_dest R_src expected.";
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg321 = function (theCode)
{
   var r3 = this.parseRegister();
   if (r3 != undefined)
   {
      this.skipSpaces();
      var r2 = this.parseRegister();
      if (r2 != undefined)
      {
         this.skipSpaces();
         var r1 = this.parseRegister();
         if (r1 != undefined)
         {
            this.skipSpaces();
            if (this.isEndOfLine() == true)
            {
               theCode = this.encodeRegister3(theCode, r3);
               theCode = this.encodeRegister2(theCode, r2);
               theCode = this.encodeRegister1(theCode, r1);
               return theCode;
            }
         }
      }
   }
   this.errorMessage = "Arguments R_dest R_src1 R_src2 expected.";
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg32Offs7 = function (theCode)
{
   var r3  = this.parseRegister();
   if (r3 != undefined)
   {
      this.skipSpaces();
      var result = this.parseAddress(0x007F);
      if (result != undefined)
      {
         this.skipSpaces();
         if (this.isEndOfLine() == true)
         {
            theCode = this.encodeRegister3(theCode, r3);
            theCode = this.encodeRegister2(theCode, result.register);
            theCode = this.encodeOffs7(theCode, result.offset);
            return theCode;
         }
      }
   }
   this.errorMessage = "Arguments R_dest [R_src +-offset] expected.";
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg3Imm8 = function (theCode)
{
   var r3 = this.parseRegister();
   if (r3 != undefined)
   {
      this.skipSpaces();
      var number = this.parseExpression();
      if (number != undefined)
      {
         if (number < 256)
         {
            if (this.isEndOfLine() == true)
            {
               theCode = this.encodeRegister3(theCode, r3);
               theCode = this.encodeImm8(theCode, number);
               return theCode;
            }
         }
      }
   }
   this.errorMessage = " R_dest imm8 expected.";
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseReg3Offs10 = function (theCode)
{
   this.skipSpaces();
   var result = this.parseAddress(0x03FF);
   if (result != undefined)
   {
      this.skipSpaces();
      if (this.isEndOfLine() == true)
      {
         theCode = this.encodeRegister3(theCode, result.register);
         theCode = this.encodeOffs10(theCode,  result.offset);
         return theCode;
      }
   }
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseRegister = function()
{
   parsePointer = this.currentChar;
   if (this.getCurrentChar() == 'R')
   {
      this.nextChar(); // Eat 'R'
      if (this.getCurrentChar() >= '0' && this.getCurrentChar() <= '7')
      {
         var register = this.getCurrentChar() - '0';
         this.nextChar(); // Eat digit
         return register;
      }
   }
   else
   if (this.getCurrentChar() == 'S')
   {
      this.nextChar(); // Eat 'S'
      if (this.getCurrentChar() == 'P')
      {
         var register = 6;
         this.nextChar(); // Eat 'P'
         return register;
      }
   }
   else
   if (this.getCurrentChar() == 'P')
   {
      this.nextChar(); // Eat 'P'
      if (this.getCurrentChar() == 'C')
      {
         var register = 7;
         this.nextChar(); // Eat 'C'
         return register;
      }
   }
   this.currentChar = parsePointer;
   return undefined;
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.parseString = function()
{
   this.skipSpaces();
   if (this.getCurrentChar() != '"')
   {
      this.errorMessage = "'\"' expected.";
   }
   this.nextChar(); // Eat '"'
   
   var string = "";
   while (isprint(this.getCurrentChar()))
   {
      switch (this.getCurrentChar())
      {
         case '"':
         {
            this.nextChar(); // Eat '"'
            return string;
         } 
         case '\\':
         {
            // TODO: Handle escape sequences
            this.nextChar(); // Eat '\'
            break;
         }
         default:
         {
            string += this.getCurrentChar();
            this.nextChar();
            break;
         }
      }
   }
   this.errorMessageM = "Invalid character in string."; 
   return undefined;
}

// ----------------------------------------------------------------------------

K16Assembler.prototype.skipCharAndSpaces = function ()
{
   this.nextChar();
   this.skipSpaces();
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.skipSpaces = function ()
{
   while (this.getCurrentChar() == ' ' || this.getCurrentChar() == '\t')
   {
      this.nextChar();
   }
};

// ----------------------------------------------------------------------------

K16Assembler.prototype.storeLabel = function (theLabel)
{
   if (this.finalPass == false)
   {
      if (theLabel in this.labelMap)
      {
         // Duplicate label
         this.errorMessage = "Label \"" + theLabel + 
                             "\" is already defined in line " + 
                             this.labelMap[theLabel].line+ ".";
         return false;
      }
      else
      {
         // New label
         var label = {};
         label.line = this.line;
         label.address = this.currentAddress;
         this.labelMap[theLabel] = label;
      }
   }
   return true;
}

