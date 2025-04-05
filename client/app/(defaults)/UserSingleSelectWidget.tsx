'use client';

import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import DropDownWidget from '@/components/modules/drop-downs/DropDownWidget';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { useEffect, useState } from 'react';

type Props = {
  options: {
    onChange: (item: ItemType[]) => void;
    value: ItemType[];
    containerClass: string;
  };
};

const UserSingleSelectWidget = ({
  options: { onChange, containerClass = 'w-full', value },
}: Props) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Array<UserFormData & { id: string }>>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // New loading state (needed cause RTK isLoading does not update in later request but first time)

  const { data, error, isLoading } = useGetUsersQuery({ page, limit: 10 });

  useEffect(() => {
    if (data) {
      setItems((prevItems) => [...prevItems, ...data.data.items]);
      setIsLoadingMore(false); // Reset loading state after data is fetched
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      // TODO: handle if an error occured about any thing ligh auth or permission of server side or ...
    }
  }, [error]);

  function onFullScroll() {
    if (!isLoadingMore && data && data.data.currentPage < data.data.totalPages) {
      setIsLoadingMore(true); // Set loading state before fetching more data
      setPage((prevPage) => prevPage + 1);
    }
  }

  return (
    <DropDownWidget
      options={{
        isLoading: isLoading || isLoadingMore,
        onFullScroll,
        isLTR: true,
        label: 'کاریر',
        selectedValue: value,
        containerClass: containerClass,
        items: items.map((item) => ({ value: item.id, label: item.email })),
        onChange: onChange,
        isMultiSelectable: true,
        multiSelectLabelsViewType: 'chips',
        // isMarquee: true,
      }}
    />
  );
};

export default UserSingleSelectWidget;
