//all the types need to be added and tested before use

globalThis.c_settings = {
  ERROR : {
    //levels are 0=nothing, 1=info, 2=warning, 3=error
    LOSSY : 2,
    OVERFLOW : false
  }
};

function findPow (value) {
  for (var c = 0 ; ; c++) {
    if(2**c == value) return c;
  }
}

//
console.prototype.dynamic = function(level){
  switch (level){
    case 0:return (function(a){}); break;
    case 1:return console.info;    break;
    case 2:return console.warning; break;
    case 3:return console.error;   break;
  }
};

class c_native{
  
  constructor() {
    this.llong = class llong{
    
      constructor(value = 0) {
        this.type = (typeof this.type == "undefined") ? "llong" : this.type;
        this.max = (typeof this.max == "undefined") ? 9223372036854775807 : this.max;
        this.min = (typeof this.min == "undefined") ? -9223372036854775808 : this.min;
        this.size = (typeof this.pow == "undefined") ? findPow(this.max+1)+1 : this.size;
        if (typeof value == "number") {
          
          if (value > this.max) {
            if ( value > Math.round(this.max * 2 + 1) ) {throw( new Error(`Number ${value} is bigger than allowed max size (${this.max}) of type:${this.type}`) )}
            //overflow it
            this.value = value-2**this.size/2**(this.size-1);
          }else if(value < this.min) {
            throw (new Error(`Number ${value} is less than allowed min size (${this.min}) of type:${this.type}`))
          }else{
            this.value = value;
          }
          
        }
        
        if(typeof value == "object" && typeof value.type != "undefined") {
          
          if(value.type == "bool") {this.value = value.value}
          if(value.type == "llong" || value.type == "int" || value.type == "long" || value.type == "char" || value.type == "short") {
            
            if (value.value > this.max) {
              console.dynamic(c_settings.ERROR.LOSSY)(`Possible lossy conversion from ${value.type} to ${this.type}`);
              //if ( value.value > Math.round(this.max * 2 + 1) ) {throw( new Error(`Number ${value} is bigger than allowed max size (${this.max}) of type:${this.type}`) )}
              //overflow it
              //this.value = value-2**this.pow/2**(this.pow-1);
            }else{
              this.value = value.value;
            }
          }
          else if (value.type == "u_llong" || value.type == "u_int" || value.type == "u_long" || value.type == "u_char" || value.type == "u_short") {
            
            if (value.value > this.max) {
              console.dynamic(c_settings.ERROR.LOSSY)(`Possible lossy conversion from ${value.type} to ${this.type}`);
              if (value.value > Math.round(this.max * 2 + 1)) { throw( new Error(`Number ${value} is bigger than allowed max size (${this.max}) of type:${this.type}`)) }
              //overflow it
              this.value = value.value-2**this.size/2**(this.size-1);
            }else{
              this.value = value.value;
            }
            
          }else if (value.type == "float" || value.type == "double" || value.type == "l_double") {
            this.value = Math.floor(value.value);
          }
        }else{
          console.error(`Incorrect data type.  Tried to convert ${typeof(value.type == "undefined") ? "JS native "+typeof(value) : "c:"value.type} to ${this.type}`);
        }
      }

    };
    
    this.u_llong = class u_llong {
    
      constructor(value = 0) {
        this.type = (typeof this.type == "undefined") ? "u_llong" : this.type;
        this.max = (typeof this.max == "undefined") ? 18446744073709551615 : this.max;
        this.min = (typeof this.min == "undefined") ? 0 : this.min;
        this.size = (typeof this.size == "undefined") ? findPow(this.max+1) : this.size;
        if (typeof value == "number") {
          
          if (value > this.max) {
            throw( new Error(`Number ${value} is bigger than allowed max size (${this.max}) of type:${this.type}`) )
          }else if(value < this.min) {
            if ( value < -this.max) throw (new Error(`Number ${value} is less than allowed min size (${this.min}) of type:${this.type}`));
            //overflow it
            this.value = value+2**this.size/2**(this.size-1);
          }else{
            this.value = value;
          }
          
        }
        
        if(typeof value == "object" && typeof value.type != "undefined") {
          
          if(value.type == "bool") {this.value = value.value}
          if(value.type == "llong" || value.type == "int" || value.type == "long" || value.type == "char" || value.type == "short") {
            
            if (value.value < this.min) {
              console.dynamic(c_settings.ERROR.LOSSY)(`Possible lossy conversion from ${value.type} to ${this.type}`);
              //if ( value.value < this.min ) {}
              //overflow it
              if ( -value.value > this.max) throw (new Error(`Number ${value.value} is less than allowed min size (${this.min}) of type:${this.type}`));
              this.value = value.value+2**this.size/2**(this.size-1);
            }else{
              this.value = value.value;
            }
          }
          else if (value.type == "u_llong" || value.type == "u_int" || value.type == "u_long" || value.type == "u_char" || value.type == "u_short") {
            
            if (value.value > this.max) {
              console.dynamic(c_settings.ERROR.LOSSY)(`Possible lossy conversion from ${value.type} to ${this.type}`);
              throw( new Error(`Number ${value.value} is bigger than allowed max size (${this.max}) of type:${this.type}`));
              //overflow it
              //this.value = value.value-2**this.size/2**(this.size-1);
            }else{
              this.value = value.value;
            }
            
          }else if (value.type == "float" || value.type == "double" || value.type == "ldouble") {
            this.value = Math.floor(value.value);
          }
        }else{
          console.error(`Incorrect data type.  Tried to convert ${typeof(value.type == "undefined") ? "JS native "+typeof(value) : "c:"value.type} to ${this.type}`);
        }
      }

    };

    this.char = class char {
      constructor(value) {
        this.max = ;
        this.min = ;
        this.type = "char";
      }
    };
    
    this.short = class short {
      constructor(value) {
        this.max = 32767;
        this.min = -32768;
        this.type = "short";
      }
    };

    this.int = class int {
      constructor(value) {
        this.max = 2147483647;
        this.min = -2147483648;
        this.type = "int";
      }
    };

    this.long = class long {
      constructor(value) {
        this.max = 2147483647;
        this.min = -2147483648;
        this.type = "long";
      }
    };

    this.u_char = class u_char {
      constructor(value) {
        this.max = 255;
        this.min = 0;
        this.type = "u_char";
      }
    };

    this.u_short = class u_short {
      constructor(value) {
        this.max = 65535;
        this.min = 0;
        this.type = "u_short";
      }
    };

    this.u_int = class u_int {
      constructor(value) {
        this.max = 4294967295;
        this.min = 0;
        this.type = "u_int";
      }
    };

    this.u_long = class u_long {
      constructor(value) {
        this.max = 4294967295;
        this.min = 0;
        this.type = "u_long";
      }
    };
    
    this.bool = class bool{
      constructor(value) {
        this.max = 1;
        this.min = 0;
        this.type = "bool";
      }
    }; 
    
    /*this. = class {
      constructor(value) {
        this.max = ;
        this.min = ;
        this.type = "";
      }
    };*/
  }

}













//can someone make an actual struct because I can't figure out how I want to do it.
//This is an iteration which involves using this as a parent to a new struct, then using the child as a class for a struct object.
//it requires you to change the value of type and varNames when inherited.
//varNames is an array of strings, and type is a constructor/class for an object, or (i guess) for a native js value.
/*class struct{
  
  private:
    var literal = {};
    
  public:
  var type = undefined;
  var varNames = {};
  
  
  constructor(){
    this.type = "struct"
    for(var c = 0; c < varNames.length; c++){
    
      this.literal[this.varNames[c]] = undefined;
      set [this.varNames[c]](value) {
        
        if(typeof value == "object"){
          if(value.type == type.type){
            literal[this.varNames]
          }
        }else{}
      }
    }
  }
  
  static type(){
    return "struct";
  }
  
}*/
