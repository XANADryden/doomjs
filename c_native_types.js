//all the types need to be added and tested before use

globalThis.c_settings={};

class c_native{
  
  static class char{
  
    constructor(value = 0){
      this.str = "";
      this.num = typeof value == "string" value.charCodeAt(0):value;
    }
  }
  
  static class int{
    constructor(value = 0){
      this.value = value;
    }
    
    set value(a){
      if(a>)
    }
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
