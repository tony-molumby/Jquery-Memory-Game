console.clear();
  
$(function(){

  var human = {
    moves: [],
    strict: false,
    count: 0,
    setStrict: function(){
      this.strict === false ? this.strict = true : this.strict = false;
      console.log('Strict: ' + this.strict);
    },
    reset: function(){
      this.moves = [];
      this.count = 0;
    },
    win: 20
  };

  var Ai = function(){
    var repeater;
    this.sequence = [];
    this.count = 0;
    this.interval = 750;
    this.playing = false;
    this.addSequence = function(){
      var rand = Math.floor((Math.random() * 4) + 1);
      this.sequence.push(rand);
    };

    this.playSequence = function(stop){
      if(stop != undefined){
        clearInterval(repeater);
      } else {
        
        $('.mem-btn').addClass('unclickable').removeClass('clickable');
        
        clearInterval(repeater);
        var _count = this.count;
        var _sequence = this.sequence;
        var _interval = this.interval;
        function countDown(){
          if(_count < _sequence.length){
              _count++;
          } else {
           $('.mem-btn').removeClass('unclickable').addClass('clickable');
            clearInterval(repeater);
          }
        }
        repeater = setInterval(function(){
          lightOn(_sequence[_count], _interval);
          countDown();
        }, _interval * 1.5);
      }

    };

    this.reset = function(){
      this.sequence = [];
      this.playing = false;
    }; 
  }
  
  //----------- Sound Class-----I was having a hard time getting the sounds to stop on mouseup, so I edited Greg Hovansyan's Sound class for my use: https://codepen.io/gregh/pen/RKVNgB?editors=0010
  
  class Sound {
    constructor(context) {
      this.context = context;
    }
    setup() {
      this.oscillator = this.context.createOscillator();
      this.gainNode = this.context.createGain();

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.context.destination);
      this.oscillator.type = 'sine';
    }

    play(value) {
      this.setup();
      this.oscillator.frequency.value = value;
      this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.01);  
      this.oscillator.start();
    }

    stop() {
      this.oscillator.stop();
    }
  }
  
  //----------------   end of class declarations    -----------------

  var aiPlayer = new Ai(), // classical or
    h = Object.create(human);//prototypal?  What are the pros / cons?

  var context = new (window.AudioContext || window.webkitAudioContext)();
  var frequencies = [180,400,300,250,200,450];
  var sound0, sound1, sound2, sound3, sound4, sound5;
  
  function checkSequence(index){
    if(h.moves[index] === aiPlayer.sequence[index]){
      return true;
    } else {
      return false;
    }
  };

  function reset(){
    aiPlayer.reset();
    h.reset();
  }

   function displayLevel(){
     if(aiPlayer.sequence.length < 10){
        $('#mem-screen').text('0' + aiPlayer.sequence.length);
      } else {
        $('#mem-screen').text(aiPlayer.sequence.length);
      }
   }
     function playSound(id){ //yes this implementation sucks, but I can't make it work any other way
     var tone = frequencies[id];
     switch(id){
       case 0:
         sound0 = new Sound(context);
         //sound0.oscillator.type = 'sawtooth';
         sound0.play(tone);
         break;
       case 1:
         sound1 = new Sound(context);
         sound1.play(tone);
         break;
       case 2:
         sound2 = new Sound(context);
         sound2.play(tone);
         break;
       case 3:
         sound3 = new Sound(context);
         sound3.play(tone);
         break;
       case 4:
         sound4 = new Sound(context);
         sound4.play(tone);
         break;
       case 5:
         sound5 = new Sound(context);
         sound5.play(tone);
         break;
     }
  }
  
  function stopSound(id){//yes this implementation sucks, but I can't make it work any other way
    switch(id){
      case 0:
        sound0.stop();
        break;
      case 1:
        sound1.stop();
        break;
      case 2:
        sound2.stop();
        break;
      case 3:
        sound3.stop();
        break;
      case 4:
        sound4.stop();
        break;
      case 5:
        sound5.stop();
     }
  }
  
   function playError(){ 
     $('.mem-btn').addClass('unclickable').removeClass('clickable');
     var count = 6;
     playSound(0);
     var int = setInterval(function(){
       if(count > 0){
         if(count % 2 == 0){
           $('#mem-screen').text('!!');
         } else {
           $('#mem-screen').text('');
         }
         count--;
       } else {
         stopSound(0);
         clearInterval(int);
         displayLevel();
       }
     }, 300);
    };
  
  function lightOn(id, time){
    $('#' + id).addClass('mem-on-' + id);
    playSound(id);
    setTimeout(function(){
      stopSound(id);
      $('#' + id).removeClass('mem-on-' + id);
    }, time);
  };
  
  function win(){
    $('#mem-screen').text('Win');
    playSound(5);
    reset();
    $('.mem-btn').addClass('unclickable').removeClass('clickable');
    setTimeout(function(){
      stopSound(5);
      aiPlayer.playing = true;
      aiPlayer.addSequence();
      displayLevel();
      aiPlayer.playSequence(); 
      $('.mem-btn').addClass('unclickable').removeClass('clickable');
    }, 2000);
  }

  $('.mem-btn').mousedown(function(){
    if(aiPlayer.playing){
      var id = parseInt($(this).attr('id'));
      $('#' + id).addClass('mem-on-' + id);
      h.moves.push(id);
      playSound(id);
    }
  });

  $('.mem-btn').mouseup(function(){
    if(aiPlayer.playing){
      var id = parseInt($(this).attr('id'));
      $('#' + id).removeClass('mem-on-' + id);
      stopSound(id);
      if(checkSequence(h.count)){
        h.count++;
        if(h.count == h.win){
          win();
        } else if(h.count == aiPlayer.sequence.length){
          h.reset();
          aiPlayer.addSequence();
          displayLevel();
          aiPlayer.playSequence();
        }
      } else if(!h.strict){
        playError();
        aiPlayer.playSequence('stop');
        h.reset();       
        setTimeout(function(){
          aiPlayer.playSequence();
        }, 1200);
        
      } else {
        playError();
        aiPlayer.playSequence('stop');
        reset();
        aiPlayer.playing = true;
        setTimeout(function(){
          aiPlayer.addSequence();
          aiPlayer.playSequence();
        }, 1200)
      }
    }
  });

  //start button function
  $('#start').on('click', function(){
    if(!aiPlayer.playing){
      $('#start').addClass('start-active');
      aiPlayer.addSequence();
      displayLevel();
      aiPlayer.playing = true;
      $('#start').text('Stop');
      aiPlayer.playSequence();
    } else {
      $('.mem-btn').addClass('unclickable').removeClass('clickable');
      $('#start').removeClass('start-active');
      reset();
      aiPlayer.playSequence('stop');
      $('#start').text('Start');
      $('#mem-screen').text('');
    }
  });

  //strict button function
  $('#strict').on('click', function(){
    if(!aiPlayer.playing){
      h.setStrict();
      if(h.strict){
        $('#strict').addClass('strict-active');
      } else {
        $('#strict').removeClass('strict-active');
      }
    }

  });
});
     
