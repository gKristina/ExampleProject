<template>
  <div :class="$style.floatingBarsG">
    <div :class="[$style.blockG, $style.rotateG_01]"></div>
    <div :class="[$style.blockG, $style.rotateG_02]"></div>
    <div :class="[$style.blockG, $style.rotateG_03]"></div>
    <div :class="[$style.blockG, $style.rotateG_04]"></div>
    <div :class="[$style.blockG, $style.rotateG_05]"></div>
    <div :class="[$style.blockG, $style.rotateG_06]"></div>
    <div :class="[$style.blockG, $style.rotateG_07]"></div>
    <div :class="[$style.blockG, $style.rotateG_08]"></div>
  </div>
</template>

<script>
  export default {
    name: "AnimatedSpinner"
  }
</script>

<style lang="scss" module>
  .floatingBarsG {
    position:relative;
    width:147px;
    height:183px;
  }
  
  .blockG{
    position:absolute;
    background-color: $ecMainLight;
    width:20px;
    height:60px;
    border-radius:19px;
    -o-border-radius:19px;
    -ms-border-radius:19px;
    -webkit-border-radius:19px;
    -moz-border-radius:19px;
    transform:scale(0.4);
    -o-transform:scale(0.4);
    -ms-transform:scale(0.4);
    -webkit-transform:scale(0.4);
    -moz-transform:scale(0.4);
    animation-name:fadeG;
    -o-animation-name:fadeG;
    -ms-animation-name:fadeG;
    -webkit-animation-name:fadeG;
    -moz-animation-name:fadeG;
    animation-duration:0.992s;
    -o-animation-duration:0.992s;
    -ms-animation-duration:0.992s;
    -webkit-animation-duration:0.992s;
    -moz-animation-duration:0.992s;
    animation-iteration-count:infinite;
    -o-animation-iteration-count:infinite;
    -ms-animation-iteration-count:infinite;
    -webkit-animation-iteration-count:infinite;
    -moz-animation-iteration-count:infinite;
    animation-direction:normal;
    -o-animation-direction:normal;
    -ms-animation-direction:normal;
    -webkit-animation-direction:normal;
    -moz-animation-direction:normal;
  }
  
  .rotateG_01 {
    left:0;
    top:67px;
    animation-delay:0.3695s;
    -o-animation-delay:0.3695s;
    -ms-animation-delay:0.3695s;
    -webkit-animation-delay:0.3695s;
    -moz-animation-delay:0.3695s;
    transform:rotate(-90deg);
    -o-transform:rotate(-90deg);
    -ms-transform:rotate(-90deg);
    -webkit-transform:rotate(-90deg);
    -moz-transform:rotate(-90deg);
  }
  
  .rotateG_02 {
    left:19px;
    top:24px;
    animation-delay:0.496s;
    -o-animation-delay:0.496s;
    -ms-animation-delay:0.496s;
    -webkit-animation-delay:0.496s;
    -moz-animation-delay:0.496s;
    transform:rotate(-45deg);
    -o-transform:rotate(-45deg);
    -ms-transform:rotate(-45deg);
    -webkit-transform:rotate(-45deg);
    -moz-transform:rotate(-45deg);
  }
  
  .rotateG_03 {
    left:62px;
    top:7px;
    animation-delay:0.6125s;
    -o-animation-delay:0.6125s;
    -ms-animation-delay:0.6125s;
    -webkit-animation-delay:0.6125s;
    -moz-animation-delay:0.6125s;
    transform:rotate(0deg);
    -o-transform:rotate(0deg);
    -ms-transform:rotate(0deg);
    -webkit-transform:rotate(0deg);
    -moz-transform:rotate(0deg);
  }
  
  .rotateG_04 {
    right:19px;
    top:24px;
    animation-delay:0.739s;
    -o-animation-delay:0.739s;
    -ms-animation-delay:0.739s;
    -webkit-animation-delay:0.739s;
    -moz-animation-delay:0.739s;
    transform:rotate(45deg);
    -o-transform:rotate(45deg);
    -ms-transform:rotate(45deg);
    -webkit-transform:rotate(45deg);
    -moz-transform:rotate(45deg);
  }
  
  .rotateG_05 {
    right:0;
    top:67px;
    animation-delay:0.8655s;
    -o-animation-delay:0.8655s;
    -ms-animation-delay:0.8655s;
    -webkit-animation-delay:0.8655s;
    -moz-animation-delay:0.8655s;
    transform:rotate(90deg);
    -o-transform:rotate(90deg);
    -ms-transform:rotate(90deg);
    -webkit-transform:rotate(90deg);
    -moz-transform:rotate(90deg);
  }
  
  .rotateG_06 {
    right:19px;
    bottom:17px;
    animation-delay:0.992s;
    -o-animation-delay:0.992s;
    -ms-animation-delay:0.992s;
    -webkit-animation-delay:0.992s;
    -moz-animation-delay:0.992s;
    transform:rotate(135deg);
    -o-transform:rotate(135deg);
    -ms-transform:rotate(135deg);
    -webkit-transform:rotate(135deg);
    -moz-transform:rotate(135deg);
  }
  
  .rotateG_07 {
    bottom:0;
    left:62px;
    animation-delay:1.1085s;
    -o-animation-delay:1.1085s;
    -ms-animation-delay:1.1085s;
    -webkit-animation-delay:1.1085s;
    -moz-animation-delay:1.1085s;
    transform:rotate(180deg);
    -o-transform:rotate(180deg);
    -ms-transform:rotate(180deg);
    -webkit-transform:rotate(180deg);
    -moz-transform:rotate(180deg);
  }
  
  .rotateG_08 {
    left:19px;
    bottom:17px;
    animation-delay:1.235s;
    -o-animation-delay:1.235s;
    -ms-animation-delay:1.235s;
    -webkit-animation-delay:1.235s;
    -moz-animation-delay:1.235s;
    transform:rotate(-135deg);
    -o-transform:rotate(-135deg);
    -ms-transform:rotate(-135deg);
    -webkit-transform:rotate(-135deg);
    -moz-transform:rotate(-135deg);
  }
  
  @keyframes fadeG {
    0%{
      background-color:rgba(255,152,1,0.98);
    }
    
    100%{
      background-color:rgb(255,255,255);
    }
  }
  
  @-o-keyframes fadeG {
    0%{
      background-color:rgba(255,152,1,0.98);
    }
    
    100%{
      background-color:rgb(255,255,255);
    }
  }
  
  @-ms-keyframes fadeG {
    0%{
      background-color:rgba(255,152,1,0.98);
    }
    
    100%{
      background-color:rgb(255,255,255);
    }
  }
  
  @-webkit-keyframes fadeG {
    0%{
      background-color:rgba(255,152,1,0.98);
    }
    
    100%{
      background-color:rgb(255,255,255);
    }
  }
  
  @-moz-keyframes fadeG {
    0%{
      background-color:rgba(255,152,1,0.98);
    }
    
    100%{
      background-color:rgb(255,255,255);
    }
  }
</style>