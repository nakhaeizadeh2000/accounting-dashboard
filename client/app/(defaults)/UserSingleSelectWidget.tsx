import DropDownWidget from '@/components/Elements/widgets/drop-downs/DropDownWidget';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { useEffect, useState } from 'react';

type Props = {
  options: {
    onChange: (item: { value: string; label: string }) => void;
    containerClass: string;
  };
};

const UserSingleSelectWidget = ({ options: { onChange, containerClass = 'w-full' } }: Props) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Array<UserFormData & { id: string }>>([]);

  const { data, error, isLoading } = useGetUsersQuery({ page, limit: 10 });

  useEffect(() => {
    if (data) {
      setItems((prevItems) => [...prevItems, ...data.data.items]);
    }
  }, [data]);

  function onFullScroll() {
    if (data && data?.data.currentPage < data?.data.totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  }

  return (
    <DropDownWidget
      options={{
        isLoading: isLoading,
        onFullScroll,
        isLTR: true,
        label: 'کاریر',
        containerClass: containerClass,
        items: items.map((item) => ({ value: item.id, label: item.email })),
        onChange: onChange,
        isMarquee: true,
      }}
    />
  );
};

export default UserSingleSelectWidget;
