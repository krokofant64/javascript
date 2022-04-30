.define $AddrSwtch 0xFFF8
.define $CtrlSwtch 0xFFF9
.define $AddrLeds  0xFFFA
.define $DataLeds  0xFFFB
.define $RegSwtch  0xFFFC
.define $IoCntrLo  0xFFFD
.define $IoCntrHi  0xFFFE
 
.define $FrameBuf  0x8000 
 
.define $Black     0x0000
.define $Blue      0x0001
.define $Green     0x0002
.define $Cyan      0x0003
.define $Red       0x0004
.define $Magenta   0x0005
.define $Yellow    0x0006
.define $White     0x0007
 
.define $BgBlack   ($Black << 3)
.define $BgBlue    ($Blue << 3)
.define $BgGreen   ($Green << 3)
.define $BgCyan    ($Cyan << 3)
.define $BgRed     ($Red << 3)
.define $BgMagenta ($Magenta << 3)
.define $BgYellow  ($Yellow << 3)
.define $BgWhite   ($White << 3)
 
.define $Mask_x0y0 ~(0x0007)
.define $Mask_x1y0 ~(0x0007 << 3)
.define $Mask_x0y1 ~(0x0007 << 6)
.define $Mask_x1y1 ~(0x0007 << 9)
 
          
               LDHZ SP 0x01 ; Set SP to 0x0100
;               LDLZ R0 ' '
;               LDLZ R1 $BgCyan | $Magenta
;               JSR FillScreen
               LDLZ R0 0x00
               LDLZ R1 0x00
               LDLZ R2 $Green.L
               LDLZ R3 15
PixelLoop:     JSR DrawPixel;
               INC R0 R0
               INC R1 R1
               DEC R3 R3
               BZC PixelLoop
               HLT
; Draw pixel
; [in] R0 = x
; [in] R1 = y
; [in] R2 = color   
DrawPixel:     PSH R0
               PSH R1
               PSH R2
               PSH R3
               PSH R4
               PSH R5
               
               ; Calculate color map address
               LDL R3 ColorMap.L
               LDH R3 ColorMap.H
               ADD R2 R2 R3
               LD R2 [R2]
               
               LDLZ R3 0
               SHR R1 R1 ; 
               ROL R3 R3
               SHR R0 R0
               ROL R3 R3
               
               LDL R4 PixelMask.L
               LDH R4 PixelMask.H
               ADD R3 R3 R4
               LD R3 [R3]
               AND R2 R2 R3
               NOT R3 R3
               JSR GetCursorPos
               LD R4 [R5]
               AND R4 R4 R3
               OR R4 R4 R2
               STO R4 [R5]
               
               POP R5
               POP R4
               POP R3      
               POP R2
               POP R1
               POP R0
               RET            
ColorMap: 
.data $Black   | ($Black << 3)   | ($Black << 6)   | ($Black << 9)   | 0x8000
.data $Blue    | ($Blue << 3)    | ($Blue << 6)    | ($Blue << 9)    | 0x8000
.data $Green   | ($Green << 3)   | ($Green << 6)   | ($Green << 9)   | 0x8000
.data $Cyan    | ($Cyan << 3)    | ($Cyan << 6)    | ($Cyan << 9)    | 0x8000
.data $Red     | ($Red << 3)     | ($Red << 6)     | ($Red << 9)     | 0x8000
.data $Magenta | ($Magenta << 3) | ($Magenta << 6) | ($Magenta << 9) | 0x8000
.data $Yellow  | ($Yellow << 3)  | ($Yellow << 6)  | ($Yellow << 9)  | 0x8000
.data $White   | ($White << 3)   | ($White << 6)   | ($White << 9)   | 0x8000
     
PixelMask:
.data 0x0007      | 0x8000
.data 0x0007 << 3 | 0x8000
.data 0x0007 << 6 | 0x8000
.data 0x0007 << 9 | 0x8000
              
; Calculate cursor position              
; [in]   R0 = column
; [in]   R1 = row
; [out]  R5 = position 
GetCursorPos:  PSH R3
               LDHZ R5 $FrameBuf.H
               LD R3  R1 ; Multiply row by 40 
               SHL R3 R3
               SHL R3 R3
               SHL R3 R3
               ADD R5 R5 R3
               SHL R3 R3
               SHL R3 R3
               ADD R5 R5 R3
               ADD R5 R5 R0 ; Add column
               POP R3
               RET
; Fill screeen
; [in] R0 = character
; [in] R1 = color           
FillScreen:    PSH R2
               PSH R3
               PSH R4
               LDL R2 R0 ; combine character and color
               LDH R2 R1
               LDHZ R3 $FrameBuf.H ; Start address
               LDL R4 (30 * 40).L  ; end address + 1
               LDH R4 (30 * 40).H
               ADD R4 R4 R3
CharacterLoop: STO R2 [R3]
               INC R3 R3
               CMP R3 R4
               BZC CharacterLoop               
               POP R4
               POP R3
               POP R2
               RET
