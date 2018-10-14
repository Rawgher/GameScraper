// On click function to help delete a comment
$(document).ready(function(){
    $("#deleteNote").on("click", function(event) {
        console.log("happening?")
        event.preventDefault();
        let link = location.href + "/" + $(this).data("notes");
        $.ajax({
            method:"DELETE",
            url: link
        })
        location.reload();
    })
})