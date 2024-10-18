import AnimatedOnlineDropDown from '@/components/Elements/drop-downs/AnimatedOnlineDropDown';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { it } from 'node:test';
import { useEffect, useState } from 'react';

type Props = {
  options: { onChange: (item: { value: string; label: string }) => void; containerClass: string };
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

  function onFullScroll(){
    if(data && data?.data.currentPage<data?.data.totalPages){
      setPage((prevPage)=> prevPage+1)
    }
    
  }

  return (
      <AnimatedOnlineDropDown
        options={{
          isLoading: isLoading,
          onFullScroll,
          label: 'کاریر',
          containerClass: containerClass,
          items: items.map((item) => ({ value: item.id, label: item.email })),
          onChange: onChange,
        }}
      />
  );
};

export default UserSingleSelectWidget;

// TODO: if selected data width is bigger that standard it ruins the ui ux in select option
// TODO: if have full scroll to end of a huge list and then closes the dropdown and again opens it, at the end of list , items are not shown correctly that is because of framer motion animationing of list items
// TODO: scroll bars ui/ux is sheet