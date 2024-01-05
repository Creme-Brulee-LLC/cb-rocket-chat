import type { LoginServiceConfiguration } from '@rocket.chat/core-typings';
import { getObjectKeys } from '@rocket.chat/tools';
import { ServiceConfiguration } from 'meteor/service-configuration';

import { CustomOAuth } from '../../../app/custom-oauth/server/custom_oauth_server';
import { settings } from '../../../app/settings/server/cached';
import { logger } from './logger';

export async function updateOAuthServices(): Promise<void> {
	const services = settings.getByRegexp(/^(Accounts_OAuth_|Accounts_OAuth_Custom-)[a-z0-9_]+$/i);
	const filteredServices = services.filter(([, value]) => typeof value === 'boolean');
	for await (const [key, value] of filteredServices) {
		logger.debug({ oauth_updated: key });
		let serviceName = key.replace('Accounts_OAuth_', '');
		if (serviceName === 'Meteor') {
			serviceName = 'meteor-developer';
		}
		if (/Accounts_OAuth_Custom-/.test(key)) {
			serviceName = key.replace('Accounts_OAuth_Custom-', '');
		}

		if (value === true) {
			const data: Partial<Omit<LoginServiceConfiguration, '_id'>> = {
				clientId: settings.get(`${key}_id`),
				secret: settings.get(`${key}_secret`),
			};

			if (/Accounts_OAuth_Custom-/.test(key)) {
				data.custom = true;
				data.clientId = settings.get(`${key}-id`);
				data.secret = settings.get(`${key}-secret`);
				data.serverURL = settings.get(`${key}-url`);
				data.tokenPath = settings.get(`${key}-token_path`);
				data.identityPath = settings.get(`${key}-identity_path`);
				data.authorizePath = settings.get(`${key}-authorize_path`);
				data.scope = settings.get(`${key}-scope`);
				data.accessTokenParam = settings.get(`${key}-access_token_param`);
				data.buttonLabelText = settings.get(`${key}-button_label_text`);
				data.buttonLabelColor = settings.get(`${key}-button_label_color`);
				data.loginStyle = settings.get(`${key}-login_style`);
				data.buttonColor = settings.get(`${key}-button_color`);
				data.tokenSentVia = settings.get(`${key}-token_sent_via`);
				data.identityTokenSentVia = settings.get(`${key}-identity_token_sent_via`);
				data.keyField = settings.get(`${key}-key_field`);
				data.usernameField = settings.get(`${key}-username_field`);
				data.emailField = settings.get(`${key}-email_field`);
				data.nameField = settings.get(`${key}-name_field`);
				data.avatarField = settings.get(`${key}-avatar_field`);
				data.rolesClaim = settings.get(`${key}-roles_claim`);
				data.groupsClaim = settings.get(`${key}-groups_claim`);
				data.channelsMap = settings.get(`${key}-groups_channel_map`);
				data.channelsAdmin = settings.get(`${key}-channels_admin`);
				data.mergeUsers = settings.get(`${key}-merge_users`);
				data.mergeUsersDistinctServices = settings.get(`${key}-merge_users_distinct_services`);
				data.mapChannels = settings.get(`${key}-map_channels`);
				data.mergeRoles = settings.get(`${key}-merge_roles`);
				data.rolesToSync = settings.get(`${key}-roles_to_sync`);
				data.showButton = settings.get(`${key}-show_button`);

				new CustomOAuth(serviceName.toLowerCase(), {
					serverURL: data.serverURL,
					tokenPath: data.tokenPath,
					identityPath: data.identityPath,
					authorizePath: data.authorizePath,
					scope: data.scope,
					loginStyle: data.loginStyle,
					tokenSentVia: data.tokenSentVia,
					identityTokenSentVia: data.identityTokenSentVia,
					keyField: data.keyField,
					usernameField: data.usernameField,
					emailField: data.emailField,
					nameField: data.nameField,
					avatarField: data.avatarField,
					rolesClaim: data.rolesClaim,
					groupsClaim: data.groupsClaim,
					mapChannels: data.mapChannels,
					channelsMap: data.channelsMap,
					channelsAdmin: data.channelsAdmin,
					mergeUsers: data.mergeUsers,
					mergeUsersDistinctServices: data.mergeUsersDistinctServices,
					mergeRoles: data.mergeRoles,
					rolesToSync: data.rolesToSync,
					accessTokenParam: data.accessTokenParam,
					showButton: data.showButton,
				});
			}
			if (serviceName === 'Facebook') {
				data.appId = data.clientId;
				delete data.clientId;
			}
			if (serviceName === 'Twitter') {
				data.consumerKey = data.clientId;
				delete data.clientId;
			}

			if (serviceName === 'Linkedin') {
				data.clientConfig = {
					requestPermissions: ['openid', 'email', 'profile'],
				};
			}

			if (serviceName === 'Nextcloud') {
				data.buttonLabelText = settings.get('Accounts_OAuth_Nextcloud_button_label_text');
				data.buttonLabelColor = settings.get('Accounts_OAuth_Nextcloud_button_label_color');
				data.buttonColor = settings.get('Accounts_OAuth_Nextcloud_button_color');
			}

			// If there's no data other than the service name, then put the service name in the data object so the operation won't fail
			const keys = getObjectKeys(data).filter((key) => data[key] !== undefined);
			if (!keys.length) {
				data.service = serviceName.toLowerCase();
			}

			await ServiceConfiguration.configurations.upsertAsync(
				{
					service: serviceName.toLowerCase(),
				},
				{
					$set: data,
				},
			);
		} else {
			await ServiceConfiguration.configurations.removeAsync({
				service: serviceName.toLowerCase(),
			});
		}
	}
}