//$(document).ajaxError((data)=>console.log(data.responseJSON));
$(document).ready(()=>list());

function list()
{
    $.ajax({
        url: '/api/todos',
        type: 'GET',
        dataType: "json",
    }).done((data)=>
        {
            console.log(data);
            var result = '<tr><th>ID</th><th>Task</th><th>Due Date</th><th>Status</th></tr>';
            for(var i=0; i<data.length; i++){
                var item = data[i];
                result += '<tr id="'+item.id+'">';
                result += '<td>'+item.id+'</td><td>'+item.task+'</td><td>'+item.due+'</td><td>'+item.status+'</td>';
                result += '<td><a href="#" onclick="edit('+item.id+')">Details</a></td>';
                result += '</tr>';
            }
            $('#listTable').html(result);
        })
        .fail((data)=>
        {
            console.log(data);
            $('#listTable').html('<tr><th>'+data.responseJSON+'</th></tr>');
            $('#result').text(data.responseJSON);
        });
        //.always(()=>console.log("this alwayus happens"));
}

function edit(id)
{
    $('#result').text('-');
    var item;
    $.ajax({
        url: '/api/todo/'+id,
        type: 'GET',
        dataType: "json",
    }).done((data)=>
        {
            // console.log(data);
            item = data;
            // console.log(item);
            if(item !== null){
                $('#currentId').text(id);
                $('input[name=task]').val(item.task);
                $('input[name=due]').val(item.due);
                $('input[name=status]').prop('checked', (item.status=='done'?true:false));
                $('#saveOrAdd').prop('disabled', false);
                $('#deletes').prop('disabled', false);
            }
        })
        .fail((err)=>
        {
            console.log(err.responseJSON);
            $('#result').text(err.responseJSON);
            item = null;
        });
    
}

function deletes()
{
    let id = $('#currentId').text();
    $.ajax({
        url: '/api/todo/'+id,
        type: 'DELETE',
        dataType: "json",
    }).done((data)=>
        {
            console.log(data);
            $('#result').text(JSON.stringify(data));
            list();
            resetInputsButtons();
        })
        .fail((err)=>
        {
            console.log(err);
            $('#result').text(err.responseJSON);
        });
}

function resetInputsButtons(){
    $('#currentId').text('-');
    $('input[name=task]').val('');
    $('input[name=due]').val('');
    $('input[name=status]').prop('checked', false);
    $('#saveOrAdd').prop('disabled', true);
    $('#deletes').prop('disabled', true);
}

function cancels(){
    resetInputsButtons();
    $('#result').text('-');
}

function addsave()
{
    var id = $('#currentId').text();
    var taskVal = $('input[name=task]').val();
    var dueDateVal = $('input[name=due]').val();
    var isDoneVal = $('input[name=status]').prop('checked') ? 'done' : 'pending';
    var todoObj = { task: taskVal, due: dueDateVal, status: isDoneVal };
    var jsonString = JSON.stringify(todoObj);
    console.log("AddSave ID: "+id);
    if(id=='-'){
        $.ajax({
            url: '/api/add',
            type: 'POST',
            dataType: 'json',
            data: jsonString
        }).done((data)=>
        {
            console.log(data);
            $('#result').text("ID: "+JSON.stringify(data)+" is added");
            list();
            resetInputsButtons();
        })
        .fail((err)=>
        {
            console.log(err);
            $('#result').text(err.responseJSON);
        });
    }else{
        $.ajax({
            url: '/api/todo/'+id,
            type: 'PUT',
            dataType: 'json',
            data: jsonString
        }).done((data)=>
        {
            var msg = "ID("+data.id+") is updated";
            console.log(msg);
            $('#result').text(msg);
            list();
            resetInputsButtons();
        })
        .fail((err)=>
        {
            console.log(err);
            $('#result').text(err.responseJSON);
        });
    }
    
}

function enableAddSave()
{
    //console.log("input is changed!");
    $('#saveOrAdd').prop('disabled', false);
}