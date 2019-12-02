$(async function() {
  // MILESTONE 2
  $('#userProfileSubmit').click(async () => {
    const data = await $.ajax({
      type: 'GET',
      dataType: 'Json',
      traditional: true,
      url: `/user/${$('#usernameProfile').val()}`
    });
    console.log(data);
    if (data.status === 'error')
      $('#userInfo').text(JSON.stringify(data.error));
    else $('#userInfo').text(JSON.stringify(data.user));
  });

  $('#userPostsSubmit').click(async () => {
    const data = await $.ajax({
      type: 'GET',
      dataType: 'Json',
      traditional: true,
      data: {
        limit: parseInt($('#postsLimit').val())
      },
      url: `/user/${$('#usernamePosts').val()}/posts`
    });
    console.log(data);
    if (data.status === 'error')
      $('#userPostInfo').text(JSON.stringify(data.error));
    else $('#userPostInfo').text(JSON.stringify(data.items));
  });

  $('#userFollowersSubmit').click(async () => {
    const data = await $.ajax({
      type: 'GET',
      dataType: 'Json',
      traditional: true,
      data: {
        limit: parseInt($('#followersLimit').val())
      },
      url: `/user/${$('#usernameFollowers').val()}/followers`
    });
    console.log(data);
    if (data.status === 'error')
      $('#userFollowersInfo').text(JSON.stringify(data.error));
    else $('#userFollowersInfo').text(JSON.stringify(data.users));
  });

  $('#userFollowingSubmit').click(async () => {
    const data = await $.ajax({
      type: 'GET',
      dataType: 'Json',
      traditional: true,
      data: {
        limit: parseInt($('#followingLimit').val())
      },
      url: `/user/${$('#usernameFollowing').val()}/following`
    });
    console.log(data);
    if (data.status === 'error')
      $('#userFollowingInfo').text(JSON.stringify(data.error));
    else $('#userFollowingInfo').text(JSON.stringify(data.users));
  });

  $('#getMediaSubmit').click(async () => {
    const data = await $.ajax({
      type: 'GET',
      url: `/media/${$('#mediaID').val()}`,
      cache: false,
      xhr: function() {
        // Seems like the only way to get access to the xhr object
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        return xhr;
      },
      success: function(data) {
        console.log('Successful in presenting media!!');
        var img = document.getElementById('mediaImage');
        var url = window.URL || window.webkitURL;
        img.src = url.createObjectURL(data);
      },
      error: () => {
        console.log('An error has occurred!');
      }
    });
    // console.log(data);
    // if (data.status === 'error')
    //   $('#getMediaInfo').text(
    //     'An error occurred in getting that media! Does it exist?'
    //   );
    // else $('#getMediaInfo').text(data);
  });

  // FOLLOWING
  $('#followUserSubmit').click(async () => {
    const isChecked = $('#followOrUnfollow').is(':checked');
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      data: {
        username: $('#userToFollow').val(),
        follow: isChecked
      },
      url: '/follow'
    });
    console.log(data);
    if (data.status === 'error') {
      $('#followUserInfo').text(data.error);
    } else {
      if (isChecked) {
        $('#followUserInfo').text(`${$('#userToFollow').val()} was followed!`);
      } else {
        $('#followUserInfo').text(
          `${$('#userToFollow').val()} was unfollowed!`
        );
      }
    }
  });

  // FOLLOWING
  $('#likeItemSubmit').click(async () => {
    const isChecked = $('#likeOrUnlikeCheckbox').is(':checked');
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      data: {
        like: isChecked
      },
      url: `/item/${$('#itemToLike').val()}/like`
    });
    console.log(data);
    if (data.status === 'error') {
      $('#likeItemInfo').text(data.error);
    } else {
      if (isChecked) {
        $('#likeItemInfo').text('The post was liked!');
      } else {
        $('#likeItemInfo').text('The post was unliked!');
      }
    }
  });

  /////////
  $('#loginSubmit').click(async () => {
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      data: {
        username: $('#loginUsername').val(),
        password: $('#loginPassword').val()
      },
      url: '/login'
    });
    console.log(data);
    if (data.status === 'error')
      $('#loginResult').text(
        'There was an error! Check your username/password'
      );
    else $('#loginResult').text('Logged in successfully!');
  });

  $('#registerSubmit').click(async () => {
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      data: {
        username: $('#registerUsername').val(),
        email: $('#registerEmail').val(),
        password: $('#registerPassword').val()
      },
      url: '/adduser'
    });

    console.log(data);
    if (data.status === 'error')
      $('#registerResult').text('There was an error! Check your fields!');
    else $('#registerResult').text('Signed Up (User Added) successfully!');
  });

  $('#addMediaSubmit').click(async () => {
    event.preventDefault();
    console.log('IN HERE');
    const form = $('#contentUploadForm')[0];
    const data = new FormData(form);
    console.log('FORM DATA');
    console.log(data);

    $('#addMediaSubmit').prop('disabled', true);

    $.ajax({
      type: 'POST',
      enctype: 'multipart/form-data',
      url: '/addmedia',
      data: data,
      processData: false,
      contentType: false,
      cache: false,
      timeout: 600000,
      success: function(data) {
        console.log(data);
        if (data.status === 'error') {
          $('#addMediaInfo').text(
            'There was an error in add media! Are you logged in? Are you submitting the proper file type?'
          );
        } else {
          $('#addMediaInfo').text(
            `Add media was successfull with id ${data.id}!`
          );
        }
        $('#addMediaSubmit').prop('disabled', false);
      },
      error: function(e) {
        console.log('Somehow in error function!');
        $('#addMediaInfo').text('Error occurred, something went wrong!');
        console.log('ERROR : ', e);
        $('#addMediaSubmit').prop('disabled', false);
      }
    });
  });

  $('#validationSubmit').click(async () => {
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      data: {
        email: $('#validationEmail').val(),
        key: $('#validationKey').val()
      },
      url: '/verify'
    });
    console.log(data);
    if (data.status === 'error')
      $('#validateResult').text('There was an error!');
    else $('#validateResult').text('User validated successfully!');
  });

  $('#addItemSubmit').click(async () => {
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,

      data: {
        content: $('#addItemContent').val(),
        childType: $('#childType').val(),
        parent: $('#parent').val(),
        media: $('#media')
          .val()
          .split(',')
      },
      url: '/additem'
    });
    console.log(data);
    if (data.status === 'error')
      $('#addItemResult').text(
        'There was an error! Check your content type/whether you are logged in.'
      );
    else $('#addItemResult').text('Item Added successfully!');
  });

  $('#deleteItemSubmit').click(async () => {
    const data = await $.ajax({
      type: 'DELETE',
      traditional: true,
      url: `/item/${$('#deleteItemID').val()}`,
      error: (xhr, statusText, err) =>
        $('#deleteItemResult').text(
          "A 404 request was given back. Looks like something went wrong! Either you are not logged in, the item does not exist, or you are trying to delete someone else's item!"
        )
    });
    console.log(data);
    $('#deleteItemResult').text('Item Deleted successfully!');
  });

  $('#searchSubmit').click(async () => {
    const timestamp = $('#timestamp').val();
    const limit = $('#limit').val();
    const q = $('#searchQuery').val();
    const username = $('#usernameQuery').val();
    const following = $('#followingQuery').is(':checked');

    const rank = $('#rankQuery').val();
    const parent = $('#parentQuery').val();
    const replies = $('#repliesQuery').is(':checked');
    const hasMedia = $('#hasMediaQuery').is(':checked');

    const postData = {
      ...(timestamp && { timestamp }),
      ...(limit && { limit }),
      ...(q && { q }),
      ...(username && { username }),
      ...{ following },

      ...(rank && { rank }),
      ...(parent && { parent }),
      ...{ replies },
      ...{ hasMedia }
    };
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      data: postData,
      url: '/search'
    });

    console.log(data);
    if (data.status === 'error')
      $('#searchItems').text('There was an error! Check your options again!');
    else
      $('#searchItems').text(
        'The matching items are ' + JSON.stringify(data.items)
      );
  });

  $('#getItemSubmit').click(async () => {
    const data = await $.ajax({
      type: 'get',
      dataType: 'Json',
      traditional: true,
      url: '/item/' + $('#itemID').val()
    });
    console.log(data);
    if (data.status === 'error')
      $('#getItemResult').text(
        "There was an error! That item probably doesn't exist"
      );
    else
      $('#getItemResult').text(
        "The item's values are " + JSON.stringify(data.item)
      );
  });

  $('#logoutSubmit').click(async () => {
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      url: '/logout'
    });
    console.log(data);
    if (data.status === 'error') $('#logoutResult').text('There was an error!');
    else $('#logoutResult').text('Logged out successful!');
  });
});
