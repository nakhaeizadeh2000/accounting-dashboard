import React from 'react';

type Props = {
  children: React.ReactNode;
};

const UserPage = (props: Props) => {
  return <div>{props.children}</div>;
};

export default UserPage;
