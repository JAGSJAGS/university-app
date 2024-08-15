export interface Users {
  data: User[];
}

export interface User {
  data: {
    id: 0,
    email: string,
    password: string,
    password_confirmation: string,
    first_name: string,
    last_name:string,
    language_id: number,
    phone_number: string,
    city_id: number,
    city_name: string
  } 
}