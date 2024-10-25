'use client';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { GetIndex } from '@/store/features/user/users.model';
import React, { useEffect, useState } from 'react';

type Props = {
  name?: string;
};

const UserListComponent = (props: Props) => {
  // Automatically fetches data when the component is mounted
  const { data, error, isLoading } = useGetUsersQuery({
    page: 1,
    limit: 15,
  });
  console.log(data);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div>
      <h1>User List</h1>
      <ul>{data?.data?.items?.map((item) => <li key={item?.id}>{item?.firstName}</li>)}</ul>
    </div>
  );
};

export default UserListComponent;
