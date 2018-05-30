$(document).ready(function() {
  $(".delete-post").on("click", function(e) {
    $target = $(e.target);
    const id = $target.attr("data-id");
    const profile = $target.attr("data-profile");
    $.ajax({
      type: "DELETE",
      url: "/wallPosts/" + id,
      success: function(response) {
        alert("Post Deleted");
        window.location.href = "/users/profile/" + profile;
      },
      error: function(err) {
        console.log(err);
      }
    });
  });
});
