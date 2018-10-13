const forumPopulator = new ForumPopulator();

$(document).ready(function() {
    displayPosts(json_context);

    $('#post-btn').on('click', submitForm);
    $('#reply-btn').on('click', submitForm);
});

const displayPosts = function(context, more_btn) {
    for (i = context.posts.length-1; i >= 0; --i) {
        post = createPostObject(context.posts[i]);
        $('.posts-container').append(post);
    }

    if (context.more) {
        if (more_btn == null)
            more_btn = forumPopulator.createMoreButton('posts', context.thread_id);
        
        more_btn.attr('index', context.index - context.amount_displaying);
        more_btn.on('click', fetchObjects);
        $('.posts-container').append(more_btn);
    }
}

const displayReplies = function(context, more_btn) {
    for(i = context.replies.length-1; i >= 0; --i) {
        reply = createReplyObject(context.replies[i]);
        $(`#reply-container-${context.post_id}`).append(reply);

        line_break = $('<hr>', {'class': 'my-4 bg-dark'});
        if(context.more || i != 0)
            $(`#reply-container-${context.post_id}`).append(line_break);   
    }

    if (context.more) {
        if (more_btn == null)
            more_btn = forumPopulator.createMoreButton('replies', context.post_id);
        
        more_btn.attr('index', context.index - context.amount_displaying).on('click', fetchObjects);
        $(`#reply-container-${context.post_id}`).append(more_btn);
    }
}

const shouldNotDisplay = function() {
    flag = object.attr('display') == 'true';
    object.attr('display', !flag);

    return !flag;
}

const fetchObjects = function() {
    object = $(this);
    index = object.attr('index');
    id = object.attr('value');
    type = object.attr('object-type');
    
    if (index == 0) 
        return;
    else if (object.is('.more-btn'))
        object.remove();
    else if (shouldNotDisplay()) {
        $(`#reply-container-${id}`).empty();
        return;
    } else
        object = null;

    fetchObjectsAjax(`/fetch_${type}/`, {'index': index, 'id': id}, object);
}

const fetchObjectsAjax = function(url, data, more) {
    $.ajax({
        url: url,
        data: data,
        contentType: 'application/json',
        success: function(data) {
            if ('replies' in data)
                displayReplies(data, more);
            else if ('posts' in data) 
                displayPosts(data, more);
        }
    });
}

const createPostObject = function(post_data) {
    const pk = post_data.pk;

    const post_object = $('<div>', {
        'class': 'border border-info border-right-0 border-left-0 border-bottom-0 post-cell',
        'id': `post-cell-${pk}`
    });
    const post = $('<div>', {'class': 'post'});
    const reply = $('<a>', replyAttributes(pk));
    const replies = $('<a>', repliesAttributes(pk));
    const author = $('<div>', {'class': 'author post-author'});
    const post_actions = $('<div>', {'class': 'container-fluid no-padding'});
    const replies_container = $('<div>', {'class': 'container-fluid', 'id': `reply-container-${pk}`, 'css': {'whitespace': 'pre-line'}});

    replies.attr('index', post_data.n_replies);

    post.text(post_data.post);
    reply.text('Reply');
    replies.text(`Replies(${post_data.n_replies})`);
    author.text(`- ${post_data.author}`);

    replies.on('click', fetchObjects);
    reply.on('click', displayReplyBox);

    post_actions.append(reply, ' - ', replies);
    post_object.append(post, author, post_actions, replies_container);

    return post_object;
}

const replyAttributes = function(pk) {
    return {
        'class': 'btn btn-link text-info',
        'value': pk,
        'data-toggle': 'modal',
        'data-target': '#ReplyCenterBox'
    };
}

const repliesAttributes = function(pk) {
    return {
        'class': 'btn btn-link text-info',
        'value': pk,
        'id': `repliesFor${pk}`,
        'display': true,
        'object-type': 'replies'
    };
}

const createReplyObject = function(reply_data) {
    const reply_object = $('<div>');
    const reply = $('<div>', {'class': 'reply', 'text': reply_data.reply});
    const author = $('<div>', {'class': 'author reply-author', 'text': `- ${reply_data.author}`});

    reply_object.append(reply, author);

    return reply_object;
}

const displayReplyBox = function() {
    post_id = $(this).attr('value');
    thread_id = $('#reply-btn').attr('value');
    $('#reply-form').attr('action',`${thread_id}/post/${post_id}/reply/create`);
}

const submitForm = function() {
    if ($('#PostCenterBox').hasClass('show')) 
        $('#post-form').submit();
    else if ($('#ReplyCenterBox').hasClass('show')) 
        $('#reply-form').submit();
}