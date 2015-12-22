$('.mapImg').poshytip({
					alignTo: 'cursor',
					alignX: 'inner-left',
					allowTipHover: 'true',
					className: 'tips-meta',
					content: '<a class="lnk-closetip" href="#void" style="color: #FFF;">Go to site</a>',
					/*followCursor: true,*/
					offsetX: 5,
					offsetY: 10,
					showOn:'hover',
					slide: 'true'				
				});
					
				$('body').delegate('.lnk-closetip', {
					showTip: function(){
						$(this).text('Hide Details');
						$('.mapImg').poshytip('show');
					},
					hideTip: function(){
						$(this).text('Show Details');
						$('.mapImg').poshytip('hide');
					},
					click: function(e){
						
						e.preventDefault();
						 
						if ($(this).text()=='Show Details') {
							$(this).trigger('reset');
							$(this).trigger('hideTip');
						} else {
							$(this).trigger('reset');
							$(this).trigger('hideTip');
						}
					}
				});