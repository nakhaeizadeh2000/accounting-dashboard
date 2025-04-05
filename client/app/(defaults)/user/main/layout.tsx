import { ReactNode } from 'react';
import TabUserMain from './TabUserMain';

type Props = {
  children: ReactNode;
};

const UserMainLayout = ({ children }: Props) => {
  return <TabUserMain>{children}</TabUserMain>;
};

export default UserMainLayout;
