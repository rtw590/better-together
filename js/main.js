$(document).ready(function() {
  $(".delete-post").on("click", function(e) {
    $target = $(e.target);
    const id = $target.attr("data-id");
    $.ajax({
      type: "DELETE",
      url: "/wallPosts/" + id,
      success: function(response) {
        alert("Post Deleted");
        window.location.href = "/users/profile/test";
      },
      error: function(err) {
        console.log("there was an error");
      }
    });
  });
});
