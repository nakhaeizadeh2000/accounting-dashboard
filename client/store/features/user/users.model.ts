import { UserFormData } from "@/schemas/validations/users/user.schema";

// Define User type based on the API response
export type User = UserFormData & { id: string };

export interface GetIndex {
  id: number;
  username: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

export interface GetFull extends GetIndex {
  email: string;
  phone: string;
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: {
      lat: string;
      long: string;
    };
  };
}

export type PostType = Omit<GetFull, 'id'> & {
  password: string;
};

export type PutType = GetFull;

export type DeleteType = Pick<GetFull, 'id'>;
