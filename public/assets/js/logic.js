$(document).ready(function() {

    // Function for making article notes and posting to database
    $(document).on("click", "#note", function() {

        $(".modal").show();
        var thisId = $(this).attr("data-id");

        var results = [];

        $(document).on("click", "#submit-review", function() {

            console.log(thisId);
            var review = $("#article-review").val().trim();
            results.push(review);
            console.log(results);

            $.ajax({
                method: "POST",
                url: "/articles/" + thisId,
                data: {
                    body: results
                }
            }).then(function(data) {
                console.log(data);
                $(".modal").hide();
                $("#article-review").val('');
            })
        })
    })

    // Closes Modal
    $(document).on("click", "#close", function() {
        console.log("modal close");
        $(".modal").hide();
        $("#article-review").val('');
    })

    // Function for displaying comments for specific article
    $(document).on("click", "#show-note", function() {
        
        var thisId = $(this).attr("data-id");
        var specific = $(this).parent().siblings(".card-footer");
        console.log(thisId);

        $.ajax({
            method: "GET",
            url: "/articles/" + thisId

        }).then(function(data) {
            console.log(data.note.body);
            $(specific).html(data.note.body);
        })
    })

    // // Clear Data function
    // $(document).on("click", "#clear-content", function() {
    //     $(".container").empty();
    // })

    // // New Scrape Function
    // $(document).on("click", "#scrape-content", function() {
    //     $.ajax({
    //         method: "GET",
    //         url: "/scrape"
    //     })
    //     .then(function() {
    //         $.ajax({
    //             method: "GET",
    //             url: "/"
    //         }).then(function(data) {
    //             console.log(data)
    //         })
    //     })
    // })
})