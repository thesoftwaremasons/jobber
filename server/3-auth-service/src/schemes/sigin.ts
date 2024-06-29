import Joi,{ObjectSchema} from 'joi';


const LoginSchema:ObjectSchema=Joi.object().keys({
    username:Joi.alternatives().conditional(Joi.string().email(),{
        then:Joi.string().email().required().messages({
            'string.base':'Email must be of type string',
            'string.email':'Invalid Email',
            'string.empty':'Email is a required field'
    }),otherwise:Joi.string().min(4).max(12).required().messages({
            'string.base':'Usename must be of type string',
            'string.min':'Invalid username',
            'string.max':'Invalid username',
            'string.empty':'Username is a required field'
    })
    
}),
password:Joi.string().min(4).max(12).required().messages({
    'string.base':'password must be of type string',
    'string.min':'Invalid password',
    'string.max':'Invalid password',
    'string.empty':'Password is a required field'
}),
});

export {LoginSchema};