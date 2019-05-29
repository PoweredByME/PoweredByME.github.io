$("#search-menu-toggle-btn").on('click', function(){
    $("#search-menu").toggleClass('hidden');
    $("#search-menu-small").toggleClass('hidden');
});


$(function() {
           
$(".js-modal-btn").modalVideo()
    
    $(".js-modal-div").modalVideo()
    
    
    
    $('button[name="daterange-1"]').daterangepicker({
            opens: 'left',
                timePicker: true,
        }, function(start, end, label) {
      
      
        console.log(start);
                console.log(end);
                console.log(label);
    
  });
     
     
      $('div[name="daterange-2"]').daterangepicker({
            opens: 'left'
        }, function(start, end, label) {
      
      
        $("#mao-data-pick-start-2").html(start.format('DD/MM/YYYY'));
      $("#mao-data-pick-end-2").html(end.format('DD/MM/YYYY'));
    
  });
     
     
      $('div[name="daterange-3"]').daterangepicker({
            opens: 'left'
        }, function(start, end, label) {
      
      
        $("#mao-data-pick-start-3").html(start.format('DD/MM/YYYY'));
      $("#mao-data-pick-end-3").html(end.format('DD/MM/YYYY'));
    
  });
     
     
     
      $('div[name="daterange-4"]').daterangepicker({
            opens: 'left'
        }, function(start, end, label) {
      
      
        $("#mao-data-pick-start-4").html(start.format('DD/MM/YYYY'));
      $("#mao-data-pick-end-4").html(end.format('DD/MM/YYYY'));
    
  });
     
     
     
});