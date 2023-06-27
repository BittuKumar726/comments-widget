import { Button, Col, Form, Input, Row } from "antd";
import { SendOutlined } from "@ant-design/icons";
import React from "react";
const ReplyForm = (props) => {
    const {comment, handleReplyToComment} = props;
  return (
    <Form
      onFinish={(values) => handleReplyToComment(comment.id, values)}
      layout="horizontal"
    >
      <Row gutter={10}>
        <Col>
          <Form.Item
            name={`reply-${comment.id}`}
            rules={[
              { required: true, message: "Please enter a reply" },
              {
                max: 100,
                message: "Reply must be less than 100 characters",
              },
            ]}
          >
            <Input placeholder="Write a reply" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Reply
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ReplyForm;