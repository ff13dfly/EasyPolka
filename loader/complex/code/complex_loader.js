$(function(){
    console.log("here to go");
    var width=5;
    var tt=setInterval(function(){
        if(width>800){
            clearInterval(tt);
            return false;
        }
        width+=5;
        $("#bar").css({"width":width+"px"})
    },100);
});