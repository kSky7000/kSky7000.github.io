/**
 * Created by Nikolay Skovorodin on 29.04.14.
 */
$( document ).ready(function(){
    //Global variables
    var difficulty = 'easy'; //0-Easy 1-Normal 2-Hard
    var currentZIndex = 1;   //Z-index for blocks
    var Image = "assets/1.jpg"; //Default Image
    var check = [];             //Array for right checking
    var right = 0;              //Variable for right checking
    var selImage = 1;           //Selected image(number)
    var grid = 4;               //Grid size
    var col_md = 'col-md-3';    //Bootstrap default style
    var height = 150;           //Default height
    //First time open game or cookies disabled
    $.cookie.json = true;
    if(!checkCookies()){
        $('.thumbnail[name='+selImage+']').addClass('selected');
        $('#myModal').modal('show');
    }

    //Click on image to select
    $('.thumbnail[id=imageselect]').click(function(e){
        var id = $(e.currentTarget).attr('name');
        if(id != selImage){
            var search = '.thumbnail[id=imageselect][name='+selImage+']';
            $(search).removeClass('selected');
            $(e.currentTarget).addClass('selected');
            selImage = $(e.currentTarget).attr('name');
        }
    });

    //Click on modal window button save
    $('.modal-footer > .btn-primary').click(function(){
        //Need to save preferences
        difficulty = $('#difficulty:checked').val();
        check = [];             //Array for right checking
        right = 0;
        //And generate game
        createPuzzle();

        //Create array for check
        for (var i = 0; i < grid; i++){
            check[i] = [];
            for (var j = 0; j < grid; j++){
                check[i][j] = 0;
            }
        }

        //Hide modal
        $('#myModal').modal('hide');
    });

    function solved(){
        $(".dblock").each(function(i,el){
            $(el).addClass('onspot');
            $(el).empty();
            $(el).draggable('destroy');
            $(el).css('opacity', '1');
            $('.body').css('cursor', 'auto');
        });
    }

    //Create Puzzle
    function createPuzzle(){
        Image = "assets/"+selImage+".jpg";
        currentZIndex = 1;
        if(!$('.thumbnail[name='+selImage+']').hasClass('selected')){
            $('.thumbnail[name='+selImage+']').addClass('selected');
        }
        if(difficulty == 'easy'){
            grid = 4;
            col_md = 'col-md-3';
            height = 150;
        } else if(difficulty == 'medium' ){
            grid = 6;
            col_md = 'col-md-2';
            height = 100;
        }else{
            grid = 12;
            col_md = 'col-md-1';
            height = 50;
        }
        var content = "";

        for(var i = 0; i < grid; i++){
            content += "<div class=\"row\">";
            for(var j = 0; j < grid; j++){
                var index = (i*grid)+j;
                content += "<div class=\""+col_md+" mblock\" id=\""+index+"\"></div>";
            }
            content += "</div>";
        }

        $('.canvas ').empty();
        $('.canvas ').append(content);
        $(".mblock").css("height", height);

        //Plus draggable blocks
        content = "";

        for(var i = 0; i < grid*grid; i++){
            content += "<div class=\"dblock\" id=\""+i+"\">"+i+"<br /></div>";
        }

        $('.blocks ').empty();
        $('.blocks ').append(content);
        $('.dblock').each(function(i,el){
            var tLeft = Math.floor(Math.random()*400),
                tTop  = Math.floor(Math.random()*500);
            $(el).css({ left: tLeft, top: tTop, height: height, width: height, "z-index" : 1});
        });

        //Setup draggable objects
        $('.dblock').draggable({
            opacity: 0.95,
            snap: true,
            cursor: "move",
            start: function( event, ui ) {
                currentZIndex++;
                $(this).css('z-index',currentZIndex);
                if( check[$(ui.helper).attr('id')] == 1){
                    right--;
                    check[$(ui.helper).attr('id')] = 0;
                }
            }
        });
        //Load images to blocks
        $(".dblock").each(function(i,el){
            var y = ~~(i/grid);
            var x = i - (y*grid);
            var xOffset = -x*height;
            var yOffset = -y*height;
            $(el).css(
                {
                    display: "block",
                    backgroundImage: "url( '" + Image + "' )",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: (
                        xOffset + "px " +
                            yOffset + "px"
                        )
                }
            );
        });

        //Setup droppable grid
        $('.mblock').droppable({
            tolerance : 'intersect',
            drop : function(event, ui) {
                //Скидываем в любую клетку.
                var y = ~~($(this).attr('id')/grid);
                var x = $(this).attr('id') - (y*grid);
                var xOffset = x*height-602;
                var yOffset = y*height;
                $(ui.draggable).css({left: xOffset, top: yOffset});
                //Проверяем
                if($(this).attr('id') == $(ui.draggable).attr('id')){
                    check[$(this).attr('id')] = 1;
                    right++;
                    if(right == grid*grid) solved();
                }

            }
        });
    }


    //Solve
    $('a.solve').click(function(){
        $(".dblock").each(function(i,el){
            //Скидываем в нужные клетки
            var y = ~~($(el).attr('id')/grid);
            var x = $(el).attr('id') - (y*grid);
            var xOffset = x*height-602;
            var yOffset = y*height;
            $(el).css({left: xOffset, top: yOffset});
        });
        for(var i = 0; i < grid*grid; i++){
            check[i] = 1;
        }
        right = grid*grid;
        solved();
    });

    //Check cookies
    function checkCookies(){
        if($.cookie('has') != 'true'){
            return false;
        }
        difficulty = $.cookie('difficulty');
        selImage = $.cookie('image');
        right = $.cookie('right');
        check = $.cookie('check');
        var coords = JSON.parse(localStorage.getItem('coords'));
        //Прочли куки, теперь создадим игру
        createPuzzle();
        //Проставим координаты
        if( coords != null){
            $(".dblock").each(function(i,el){
                var a = coords[i].x;
                $(el).css('left', coords[i].x);
                $(el).css('top', coords[i].y);
            });
        }
        if(right == grid*grid)solved();
        //Конец
        return true;
    }


    $(window).unload(function(e){
        var coords = [];
        $(".dblock").each(function(i,el){
            coords[i] = {x: $(el).css('left'), y: $(el).css('top')};
        });
        coords = JSON.stringify(coords);
        localStorage.setItem("coords", coords);
        $.cookie('check', check, {
            expires: 30
        });
        $.cookie('has', 'true', {
            expires: 30
        });
        $.cookie('right', right, {
            expires: 30
        });
        $.cookie('image', selImage, {
            expires: 30
        });
        $.cookie('difficulty', difficulty, {
            expires: 30
        });
    });





});