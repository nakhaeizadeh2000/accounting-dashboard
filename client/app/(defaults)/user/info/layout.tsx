import Link from 'next/link';
import TabUserInfo from './TabUserInfo';

type Props = {
  children: React.ReactNode;
};

const UserInfoLayout = ({ children }: Props) => {
  return <TabUserInfo>{children}</TabUserInfo>;
};

export default UserInfoLayout;
