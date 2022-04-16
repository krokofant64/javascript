editAreaLoader.load_syntax["k16"] = {
	'DISPLAY_NAME' : 'K16',
   'COMMENT_SINGLE' : {1 : ';'},
   'COMMENT_MULTI' : {},
   'QUOTEMARKS' : {1: "'", 2: '"'},
   'KEYWORD_CASE_SENSITIVE' : true,
   'KEYWORDS' : {
		'registers' : [
			'PC', 'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'SP'
		],
      'mnemonics' : [
			'ADC', 'ADD', 'AND', 'ASHL', 'ASHR', 'BCC', 'BCS',
			'BNC', 'BNS', 'BOC', 'BOS', 'BZC', 'BZS', 'CLC',
			'CLI', 'CMP', 'DEC', 'HLT', 'INC', 'JMP', 'JSR', 'LD',		
			'LDH', 'LDHZ', 'LDL', 'LDLZ', 
			'NOT', 'OR', 'POP', 'PSH', 'RET', 'ROL', 'ROR', 'RTI', 
			'SBC', 'SEC', 'SEI', 'SHL', 
			'SHR', 'STO', 'SUB', 'SWP', 'XOR'			
		],
      'directives' : [
			// common functions for Window object
			'data', 'define', 'org', 'string' 
		]
	},
   'OPERATORS' :[
		'+', '-', '/', '*', '<<', '>>', '%', '&', '|', '~', '^', '.H', '.L'
	],
   'DELIMITERS' :[
		'(', ')', '[', ']'
	],
   'STYLES' : {
		'COMMENTS': 'color: #AAAAAA;',
      'QUOTESMARKS': 'color: #6381F8;',
      'KEYWORDS' : {
			'registers' : 'color: #60CA00;',
         'mnemonics' : 'color: #48BDDF;',
         'directives' : 'color: #2B60FF;'
		},
      'OPERATORS' : 'color: #FF00FF;',
      'DELIMITERS' : 'color: #0038E1;'
	}

};
