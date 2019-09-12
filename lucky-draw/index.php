<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Truyền hình FPT - Quay số trúng thưởng</title>

<meta name="description" content="flip efect with css3 keyframe">
<meta name="viewport" content="width=700, user-scalable=no">
<!--  JQuery -->
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

<!-- Optional theme -->
<link rel="stylesheet"
	href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">

<!-- Latest compiled and minified JavaScript -->
<script
	src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

<link rel="stylesheet" href="main.css">

<script type="text/javascript">
		var playing = false;
		var intervals = [];
		var stops = [];
		var maps = [
		 	{ 
		 		'A': 0, 'B': 1, 'C': 2, 'D': 3, 
				'G': 4, 'H': 5, 'K': 6, 'L': 7, 
				'N': 8, 'P': 9, 'Q': 10, 'S': 11, 
				'T': 12, 'V': 13, 'Y': 14
			}, { 
				'A': 0, 'B': 1, 'C': 2, 'D': 3, 
				'E': 4, 'G': 5, 'H': 6, 'I': 7, 
				'L': 8, 'M': 9, 'N': 10, 'P': 11, 
				'Q': 12, 'S': 13, 'T': 14, 'U': 15, 
				'V': 16, 'Y': 17
			}, { 
				'A': 0, 'B': 1, 'D': 2, 'F': 3, 'H': 4	
			}, { 
				'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, 
				'5': 5, '6': 6, '7': 7, '8': 8, 
				'9': 9, 'D': 10, 'F': 11, 'N': 12 
			}
		];

		$(document).ready(function() {
			$('#play-btn').click(function(event) {
				event.preventDefault();
				
				if(playing) {
					return;
				}

				console.log("--- START ROLLING");
				$('#play-btn').attr('disabled', 'disabled');
				$('#info').attr('style','display: none');
				$('#name').text('');
				$('#address').text('');
				$('#price').text('');
				playing = true;
				
				// START ANIMATION							
				for(i = 0; i < 9; i++) {
					var duration = Math.floor(Math.random() * 1000) + 500;
					intervals[i] = setInterval(function (index) {
						numPlay(index);
				    }, duration, i);
				}
				
				// GET data here
				console.log("--- GET RESULT");
				
				var t = new Date().getTime();
			   	$.ajax({
					url: 'data.php?t=' + t,
					type: 'post',
					data: '',
					cache: false,
			      	success: function(data) {
				      	if(data.result == 1) {
							// STOP ANIMATION AND SET RESULT
							// MININUM 2000 animation
							
							console.log("--- RESULT", data);
							setTimeout(stopRolling, 2000, data);
				      	} else {
				      		console.log('ERROR');
				      		setTimeout(stopRolling, 2000, null);
				      	}	
			      	},
			      	error: function() {
			      		console.log('ERROR');
			      		setTimeout(stopRolling, 2000, null);
			      	}
			 	});
			});			
		});
		
		function stopRolling(result) {
			console.log("--- STOP ROLLING", result);
			
			for(i = 0; i < 9; i++) {
				clearInterval(intervals[i]);
			}

			// ERROR??
			var number = 'AAA000000';
			if(result) {
				number = result.contract_no;
			}
			
			for(j = 0; j < number.length; j ++) {
				var n = 0;
				var chr = number.charAt(j);

				// 0, 1, 2, 3
				if(j < 4) {
					map = maps[j];
					n = map[chr.toUpperCase()];					
				} else {
					n = parseInt(chr);
				}

				// 600ms?
				var duration = Math.floor(Math.random() * 200) + 300;
				stops[j] = setInterval(function (index, n) {
					runTo(index, n);
			    }, duration, j, n);
			}
			
			// Maxinum clear all interval is 3000?
			setTimeout(function() {
				playing = false;
				$('#play-btn').attr('disabled', false);							
				$('#play-btn').html('Quay lại');
				$('#info').attr('style','display: inline');
				if(result) {
					$('#name').text(result.customer_name);
					$('#address').text(result.address);
					$('#price').text(result.type);
				} else {
					$('#name').text('');
					$('#address').text('');
					$('#price').text('Có lỗi xảy ra');
				}
			}, 10000);
		}
		
		function runTo(index, num) {
			var lis = $("ul." + "num0" + (index + 1) + " li");
			
			var li = lis[num];			
			if($(li).hasClass("active")) {
				// This is right number, DO NOTHING HERE
				clearInterval(stops[index]);
				return;
			}
			
			numPlay(index);
		}
	    
	    function numPlay(index) {
	    	var cls = "num0" + (index + 1);
	    		
	        $("body").removeClass("play");
	        var aa = $("ul." + cls + " li.active");
	
	        if (aa.html() == undefined) {
	            aa = $("ul." + cls + " li").eq(0);
	            aa.addClass("before")
	                .removeClass("active")
	                .next("li")
	                .addClass("active")
	                .closest("body")
	                .addClass("play");
	
	        }
	        else if (aa.is(":last-child")) {
	            $("ul." + cls + " li").removeClass("before");
	            aa.addClass("before").removeClass("active");
	            aa = $("ul." + cls + " li").eq(0);
	            aa.addClass("active")
	                .closest("body")
	                .addClass("play");
	        }
	        else {
	            $("ul." + cls + " li").removeClass("before");
	            aa.addClass("before")
	                .removeClass("active")
	                .next("li")
	                .addClass("active")
	                .closest("body")
	                .addClass("play");
	        }
	
	    }    
	</script>
</head>
<body style="overflow: hidden;">
	<div id="header" class="col-md-offset-2">
		<div class="col-md-2 col-vertical-center">
			<img alt="Truyen hinh FPT" src="images/logo.png" />
		</div>
		<div class="col-md-8 col-vertical-center">
			<span style="font-size: 20pt; font-weight: bold; color: #ffffff">CHƯƠNG TRÌNH</span>
			<p>
				<span
					style="font: bold 70px 'Helvetica Neue', Helvetica, sans-serif; color: #ffffff">Quay số trúng thưởng</span>
			</p>
		</div>
	</div>
	<div id="rolling" class="row">
		<div class="col-center">
			<ul class="flip num01">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/a.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/a.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/b.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/b.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/c.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/c.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/g.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/g.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/h.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/h.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/k.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/k.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/l.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/l.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/n.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/n.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/p.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/p.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/q.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/q.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/s.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/s.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/t.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/t.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/v.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/v.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/y.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/y.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num02">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/a.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/a.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/b.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/b.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/c.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/c.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/e.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/e.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/g.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/g.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/h.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/h.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/i.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/i.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/l.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/l.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/m.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/m.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/n.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/n.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/p.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/p.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/q.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/q.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/s.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/s.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/t.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/t.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/u.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/u.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/v.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/v.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/y.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/y.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num03">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/a.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/a.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/b.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/b.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/f.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/f.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/h.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/h.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num04">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/d.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/f.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/f.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/n.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/n.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num05">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num06">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num07">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num08">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
				</a></li>
			</ul>

			<ul class="flip num09">
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/0.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/1.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/2.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/3.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/4.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/5.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/6.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/7.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/8.png" />
							</div>
						</div>
				</a></li>
				<li><a href="#">
						<div class="up">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
						<div class="down">
							<div class="shadow"></div>
							<div class="inn">
								<img src="images/9.png" />
							</div>
						</div>
				</a></li>
			</ul>
		</div>
		<button id="play-btn" type="button" class="btn">Quay số</button>
		<div id="info" class="col-center" style="display: none;">
			<span style="color: #fff;">Họ và tên khách hàng: </span><span
				id="name"></span><br /> <span style="color: #fff;">Địa chỉ: </span><span
				id="address"></span><br /> <span style="color: #fff;">Giải: </span><span
				id="price"></span>
		</div>
	</div>
</body>
</html>