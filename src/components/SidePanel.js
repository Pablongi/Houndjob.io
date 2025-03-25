// src/components/SidePanel.js
import React from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  width: 300px;
  background-color: #f0faff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s;
  &:hover {
    background: linear-gradient(to right, #e0f7fa, #f0faff);
  }
`;

const Widget = styled.div`
  background-color: #fff;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #e6f7fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-in;
`;

const WidgetTitle = styled.h4`
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
`;

const SavedJobList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SavedJobItem = styled.li`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  cursor: pointer;
  &:hover {
    color: #00c4b4;
    transform: scale(1.05);
    transition: transform 0.2s;
  }
`;

const RelatedSearches = styled.div`
  background-color: #fff;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e6f7fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-in;
`;

const RelatedSearchItem = styled.a`
  display: block;
  font-size: 14px;
  color: #666;
  text-decoration: none;
  margin-bottom: 5px;
  &:hover {
    color: #00c4b4;
    transform: scale(1.05);
    transition: transform 0.2s;
  }
`;

const QRSection = styled.div`
  margin-bottom: 20px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
`;

const QRPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  background-color: #e6e6e6;
  border-radius: 4px;
  margin-bottom: 10px;
  animation: pulse 2s infinite;
`;

const LoginForm = styled.div`
  background-color: #fff;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e6f7fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-in;
`;

const Label = styled.p`
  font-size: 14px;
  color: #333;
  margin: 5px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  &:focus {
    outline: 2px solid #00c4b4;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  background-color: ${(props) => (props.primary ? '#00c4b4' : '#fff')};
  color: ${(props) => (props.primary ? '#fff' : '#00c4b4')};
  border: 1px solid #00c4b4;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s;
  &:hover {
    opacity: 0.9;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const SidePanel = ({
  phoneNumber,
  setPhoneNumber,
  verificationCode,
  setVerificationCode,
  onSendVerification,
  onLogin,
  savedJobs,
}) => {
  const relatedSearches = ['php', 'golang', 'C++', 'Python', 'front end', 'Embedded'];

  return (
    <Panel>
      <Widget>
        <WidgetTitle>Saved Jobs</WidgetTitle>
        <SavedJobList>
          {savedJobs.length > 0 ? (
            savedJobs.map((job) => (
              <SavedJobItem key={job.id} onClick={() => alert(`Viewing job: ${job.title}`)}>
                {job.title}
              </SavedJobItem>
            ))
          ) : (
            <SavedJobItem>No saved jobs yet.</SavedJobItem>
          )}
        </SavedJobList>
      </Widget>
      <QRSection>
        <QRPlaceholder />
        <p>Scan the QR code on WeChat to get real-time information on new positions</p>
        <p>Subscribe to [Shanghai/java] related positions, real-time notification of new positions online, and job hunting faster</p>
      </QRSection>
      <LoginForm>
        <Label>Choose from a variety of job positions...</Label>
        <Label>
          <span style={{ color: '#00c4b4' }}>+86</span> · Phone number
        </Label>
        <Input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone number"
          aria-label="Phone number input"
        />
        <Button onClick={onSendVerification} aria-label="Send verification code">
          SMS verification code
        </Button>
        <Input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Verification code"
          aria-label="Verification code input"
        />
        <Button primary onClick={onLogin} aria-label="Login or register">
          Login/Register
        </Button>
        <CheckboxLabel>
          <input type="checkbox" style={{ marginRight: '5px' }} aria-label="Accept terms" /> I have read and agreed to BOSS Zhipin's User Agreement and Privacy
        </CheckboxLabel>
      </LoginForm>
      <RelatedSearches>
        <WidgetTitle>Related Searches</WidgetTitle>
        {relatedSearches.map((search, index) => (
          <RelatedSearchItem key={index} href={`#${search}`}>
            {search}
          </RelatedSearchItem>
        ))}
      </RelatedSearches>
    </Panel>
  );
};

export default SidePanel;