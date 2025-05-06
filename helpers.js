import { ObjectId } from "mongodb";

export const checkString = (string) => {
    if (!string) throw 'You must provide a string'
    if (typeof string !== 'string') throw `${string} must be a string`
    string = string.trim()
    if (string.length === 0)
        throw `${string} cannot be an empty string or string with just spaces`
    return string
}
export const checkID = (id) => {
    if (!id) throw 'You must provide an id to search for'
    if (typeof id !== 'string') throw `${id} must be a string`
    id = id.trim()
    if (id.length === 0)
        throw `${id} cannot be an empty string or just spaces`
    if (!ObjectId.isValid(id)) throw 'invalid object ID'
    return id
}
export const checkEmail = (email) => {
    email = checkString(email)
    if (email.includes(' '))
        throw `${email} can't contain empty spaces`
    if (!/^[^\s@]+@stevens\.edu$/.test(email))
        throw `${email} must be a valid Stevens email address`;
    return email
}
export const checkPassword = (password) => {
    password = checkString(password)
    if (password.includes(' '))
        throw `Password can't contain spaces`
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password))
        throw `Password needs to have atleast one uppercase letter, one number, and one special character`
    if (password.length < 8)
        throw `Password needs to be at least 8 characters long`
    return password
}