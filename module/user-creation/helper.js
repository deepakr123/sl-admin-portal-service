/**
 * name : user-creation/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

let userManagementService =
    require(ROOT_PATH + "/generics/services/user-management");

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

module.exports = class userCreationHelper {

    /**
   * Get user creation form.
   * @method
   * @name  getForm
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of user creation form.
   */

    static getForm(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileDocuments =
                    await database.models.forms.findOne({
                        name: constants.common.USER_CREATE_FORM
                    });


                let stateInfo = await database.models.entities.find({ entityType: constants.common.STATE_ENTITY_TYPE },
                    { entityTypeId: 1, _id: 1, metaInformation: 1, groups: 1, childHierarchyPath: 1 }).lean();

              
                let states = [];
                let stateListWithSubEntities = [];
                let stateInfoWithSub = {};

                if (stateInfo) {
                    await Promise.all(stateInfo.map(async function (state) {
                        if (state.groups) {
                            let found = await _checkStateWithSubEntities(state.groups, state.entityTypeId);
                            if (found && state.groups) {
                                stateInfoWithSub[state._id] = state.childHierarchyPath;
                            }
                        }
                        states.push({
                            label: state.metaInformation.name,
                            value: state._id
                        });
                    }));


                    let profileInfo = await sunBirdService.getUserProfileInfo(req.userDetails.userToken,req.userDetails.userId);
               

                    let organisations = [];

                    let userProfileInfo = JSON.parse(profileInfo);


                    if( userProfileInfo && userProfileInfo.result && 
                        userProfileInfo.result.response &&
                         userProfileInfo.result.response.organisations){
                             organisations = userProfileInfo.result.response.organisations;
                    }
                   
                    let organisationList = [];
                    await Promise.all(organisations.map(async function(organisation){
                        let orgObj = {
                            "organisationId":organisation.organisationId
                        }
                        organisationList.push(orgObj);
                    }));
                   

                    stateListWithSubEntities.push(stateInfoWithSub);
                    let formsFields = [];
                    await Promise.all(userProfileDocuments.value.map(async function (fields) {

                        let inputFiled = fields;
                        if (fields.label == "state") {
                            inputFiled.options = states;
                        }
                        if (fields.label == "organisations") {
                            inputFiled.options = organisationList;
                        }
                        formsFields.push(inputFiled);

                    }));
                    if (userProfileDocuments) {
                        let response = {
                            form: formsFields,
                            stateListWithSubEntities:stateListWithSubEntities,
                            profileInfo:userProfileInfo.result.response.organisations
                        }
                        return resolve({ result: response });
                    } else {
                        // apiResponses
                        reject({ message: constants.apiResponses.USER_CREATE_FORM_NOT_FOUND });
                    }
                }


            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * create create.
   * @method
   * @name  create
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of created user.
   */

    static create(req) {
        return new Promise(async (resolve, reject) => {
            try {
                    let userProfileCreationData =
                        await userManagementService.createPlatFormUser(
                            req.body, req.userDetails.userToken
                        )
                    return resolve(userProfileCreationData);    
            } catch (error) {
                return reject(error);
            }
        })
    }


};

/**
  * check state has subEntities
  * @method
  * @name _checkStateWithSubEntities
  * @param { string } stateId - Array of entities.
  * @returns {boolean}
  * */

 function _checkStateWithSubEntities(groups, entityTypeId) {
    return new Promise(async (resolve, reject) => {
        try {

         
            let entityTypeList = Object.keys(groups);
            let entityTypeDoc =
                await database.models.entityTypes.findOne({
                    _id: entityTypeId
                }, { immediateChildrenEntityType: 1 }).lean();
            if (entityTypeDoc && entityTypeDoc.immediateChildrenEntityType && entityTypeDoc.immediateChildrenEntityType.length > 0) {

                Promise.all(entityTypeList.map(async function (types) {
                    if (entityTypeDoc.immediateChildrenEntityType.includes(types)) {
                        resolve(true);
                    }
                }));
                resolve(false)
            } else {
                resolve(false);
            }
        } catch (err) {
            return reject(err);
        }
    });
}