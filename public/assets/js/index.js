$(document).ready(function(){
    console.log("am i happening first?")
    $("#deleteNote").on("click", function(event) {
        console.log("am i happening?")
        event.preventDefault();
        let link = location.href + "/" + $(this).data("notes");
        $.ajax({
            method:"DELETE",
            url: link
        })
        location.reload();
    })
})