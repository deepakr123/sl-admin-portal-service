/**
 * name : user-management.js
 * author : Rakesh Kumar
 * Date : 17-March-2020
 * Description : All user management related api call.
 */

//dependencies

let urlPrefix = 
process.env.USER_MANAGEMENT_HOST + 
process.env.USER_MANAGEMENT_BASE_URL +
process.env.URL_PREFIX; 

const request = require('request');

/**
  * Get platform user roles
  * @function
  * @name platformUserProfile
  * @returns {Promise} returns a promise.
*/

var platformUserProfile = function ( userId,token ) {

    const platformUserRolesUrl = 
    urlPrefix + constants.endpoints.PLATFORM_USER_PROFILE+"/"+userId;
    
    return new Promise(async (resolve, reject) => {
        try {

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.get(
                platformUserRolesUrl,{
                    headers: {
                        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                        "X-authenticated-user-token" : token 
                    }
                },
                _userManagementCallBack
            )

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * post create PlatForm User 
  * @function
  * @name createPlatFormUser
  * @returns {Promise} returns a promise.
*/

var createPlatFormUser = function ( requestBody,token ) {

    const platformUserRolesUrl = 
    urlPrefix + constants.endpoints.PLATFORM_USER_CREATE;
    
    return new Promise(async (resolve, reject) => {
        try {


            let options = {
                "headers":{
                "content-type": "application/json",
                "authorization" :  process.env.AUTHORIZATION,
                "x-authenticated-user-token" : token,
                "x-channel-id" : constants.SUNBIRD_ORGANISATION_ID 
                },
                json : requestBody
            };
            
             request.post(platformUserRolesUrl,options,callback);
            
            function callback(err,data){
                if( err ) {
                    return reject({
                        message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    });
                } else {
                    let dialCodeData = data.body;
                    return resolve(dialCodeData);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })

}


module.exports = {
    platformUserProfile : platformUserProfile,
    createPlatFormUser:createPlatFormUser
};