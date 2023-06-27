import { Button, Col, Input, Row } from "antd";

const EditForm = (props) => {
    const {commentId, replyRef, setReplyRef, handleSaveEditComment} = props
  return (
    <Row gutter={10}>
      <Col>
        <Input
          value={replyRef[commentId]}
          onChange={(e) =>
            setReplyRef({
              ...replyRef,
              [commentId]: e.target.value,
            })
          }
        />
      </Col>
      <Col>
        <Button
          key="save"
          type="primary"
          onClick={() => handleSaveEditComment(commentId)}
        >
          Save
        </Button>
      </Col>
    </Row>
  );
};


export default EditForm;