$(async function() {
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
        content: $('#content').val(),
        childType: $('#childType').val()
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

  $('#searchSubmit').click(async () => {
    const data = await $.ajax({
      type: 'POST',
      dataType: 'Json',
      traditional: true,
      data: {
        timestamp: $('#timestamp').val(),
        limit: $('#limit').val()
      },
      url: '/search'
    });
    console.log(data);
    if (data.status === 'error')
      $('#searchItems').text('There was an error! Check your timestamp/limit!');
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
