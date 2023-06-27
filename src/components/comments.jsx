// Library imports
import React, { useState } from "react";
import { Comment as AntdComment } from "@ant-design/compatible"; 
import { Button, Card, Form, Input, Space, Tooltip } from "antd";
import moment from "moment"; // Importing the 'moment' library for date and time manipulation

// Importing custom components
import "./comment.css"; // Importing the CSS file for styling
import EditForm from "./editForm"; // Importing the EditForm component
import ReplyForm from "./replyForm"; // Importing the ReplyForm component

const { TextArea } = Input; // Destructuring and importing the TextArea component from the Input component

const CommentWidget = () => {
  // State variables
  const [comments, setComments] = useState([]); // State variable to store the list of comments
  const [replyRef, setReplyRef] = useState({}); // State variable to store the reference for the reply input
  const [replyVisible, setReplyVisible] = useState({}); // State variable to track the visibility of the reply input
  const [editCommentId, setEditCommentId] = useState(null); // State variable to store the comment ID being edited
  const [editReplyId, setEditReplyId] = useState(null); // State variable to store the reply ID being edited

  // Function to add a new comment
  const handleAddComment = (values, parentId = null) => {
    const newComment = {
      id: Date.now(),
      content: values.comment,
      timestamp: moment(),
      replies: [],
    };

    if (parentId) {
      // Add the reply to a comment
      const updatedComments = addReplyToComment(newComment, parentId, comments);
      setComments(updatedComments);
    } else {
      // Add a new comment
      setComments([...comments, newComment]);
    }
  };

  // Recursive function to add a reply to a comment
  const addReplyToComment = (newReply, parentId, commentArr) => {
    return commentArr.map((comment) => {
      if (comment.id === parentId) {
        // If the comment matches the parent ID, add the reply to its replies array
        return {
          ...comment,
          replies: [...comment.replies, newReply],
        };
      } else {
        // If the comment doesn't match, recursively check its replies array
        return {
          ...comment,
          replies: addReplyToComment(newReply, parentId, comment.replies),
        };
      }
    });
  };

  // Function to handle replying to a comment
  const handleReplyToComment = (parentId, values) => {
    const parentCommentId = parentId;
    const replyContent = values[`reply-${parentId}`] || "";
    setReplyRef({
      ...replyRef,
      [parentCommentId]: replyContent,
    });

    handleAddComment({ comment: replyContent }, parentId);
    setReplyVisible({ ...replyVisible, [parentId]: false });
  };
  
  // Function to handle deleting a comment
  const handleDeleteComment = (commentId, commentArr = comments) => {
    const updatedComments = commentArr.filter((comment) => {
      if (comment.id === commentId) {
        // Recursively delete all replies
        comment.replies.forEach((reply) => {
          handleDeleteComment(reply.id, comment.replies);
        });
        return false;
      }

      // Check if comment has replies and update the replies array
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = handleDeleteComment(commentId, comment.replies);
      }

      return true;
    });

    if (commentArr === comments) {
      setComments(updatedComments);
    }

    return updatedComments;
  };

  // Function to toggle the visibility of the reply input
  const toggleReplyInput = (commentId) => {
    setReplyVisible({ ...replyVisible, [commentId]: !replyVisible[commentId] });
  };

  // Function to handle editing a comment
  const handleEditComment = (commentId, content) => {
    setEditCommentId(commentId);
    setReplyRef({ ...replyRef, [commentId]: content });
  };

  // Function to save the edited comment
  const handleSaveEditComment = (commentId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          content: replyRef[commentId],
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setEditCommentId(null);
  };

  // Function to handle editing a reply
  const handleEditReply = (replyId, content) => {
    setEditReplyId(replyId);
    setReplyRef({ ...replyRef, [replyId]: content });
  };

  // Function to save the edited reply
  const handleSaveEditReply = (replyId) => {
    const updatedComments = comments.map((comment) => ({
      ...comment,
      replies: comment.replies.map((reply) => {
        if (reply.id === replyId) {
          return {
            ...reply,
            content: replyRef[replyId],
          };
        }
        return reply;
      }),
    }));

    setComments(updatedComments);
    setEditReplyId(null);
  };

  const sortedComments =(comment)=> [...comment].sort((a, b) => new Date(b.id) - new Date(a.id));

  // Function to render replies recursively
  const renderReplies = (replies, commentId) => {
    if (!replies) {
      return null;
    }

    return sortedComments(replies).map((reply) => (
      <AntdComment
        key={reply.id}
        author="Anonymous"
        content={
          editReplyId === reply.id ? (
            <EditForm
              commentId={reply.id}
              replyRef={replyRef}
              setReplyRef={setReplyRef}
              handleSaveEditComment={handleSaveEditReply}
            />
          ) : (
            reply.content
          )
        }
        datetime={
          <Tooltip title={reply.timestamp.format("YYYY-MM-DD HH:mm:ss")}>
            <span>{reply.timestamp.fromNow()}</span>
          </Tooltip>
        }
        actions={[
          <Space wrap>
            <Button
              key="reply"
              type="primary"
              ghost
              onClick={() => toggleReplyInput(reply.id)}
            >
              Reply
            </Button>
            <Button
              key="edit"
              type="primary"
              ghost
              onClick={() => handleEditReply(reply.id, reply.content)}
            >
              Edit
            </Button>
            <Button
              key="delete"
              danger
              onClick={() => handleDeleteComment(reply.id)}
            >
              Delete
            </Button>
          </Space>,
        ]}
      >
        {replyVisible[reply.id] && (
          <ReplyForm
            comment={reply}
            handleReplyToComment={handleReplyToComment}
          />
        )}
        {renderReplies(reply.replies, commentId)}
      </AntdComment>
    ));
  };

  // Function to render comment actions
  const renderCommentActions = (comment) => {
    return [
      <Space wrap>
        <Button
          key="reply"
          type="primary"
          ghost
          onClick={() => toggleReplyInput(comment.id)}
        >
          Reply
        </Button>
        <Button
          key="edit"
          type="primary"
          ghost
          onClick={() => handleEditComment(comment.id, comment.content)}
        >
          Edit
        </Button>
        <Button
          key="delete"
          danger
          onClick={() => handleDeleteComment(comment.id)}
        >
          Delete
        </Button>
      </Space>,
    ];
  };

  return (
    <div className="comment-box">
      <h2>Comment Widget</h2>
      <Form
        onFinish={handleAddComment}
        layout="vertical"
        className="input-container"
      >
        <Form.Item
          name="comment"
          label="Add Comment"
          rules={[
            { required: true, message: "Please enter a comment" },
            { max: 100, message: "Comment must be less than 100 characters" },
          ]}
        >
          <TextArea rows={4} placeholder="Write a comment..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Comment
          </Button>
        </Form.Item>
      </Form>
      <div>
        {sortedComments(comments).map((comment) => (
          <Card key={comment.id} className="comment-list">
            <AntdComment
              key={comment.id}
              author="Anonymous"
              content={
                editCommentId === comment.id ? (
                  <EditForm
                    commentId={comment.id}
                    replyRef={replyRef}
                    setReplyRef={setReplyRef}
                    handleSaveEditComment={handleSaveEditComment}
                  />
                ) : (
                  comment.content
                )
              }
              datetime={
                <Tooltip
                  title={comment.timestamp.format("YYYY-MM-DD HH:mm:ss")}
                >
                  <span>{comment.timestamp.fromNow()}</span>
                </Tooltip>
              }
              actions={renderCommentActions(comment)}
            >
              {replyVisible[comment.id] && (
                <ReplyForm
                  comment={comment}
                  handleReplyToComment={handleReplyToComment}
                />
              )}
              {renderReplies(comment.replies, comment.id)}
            </AntdComment>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommentWidget;
