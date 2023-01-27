import type { IReport } from '@rocket.chat/core-typings';
import Ajv from 'ajv';

const ajv = new Ajv({ coerceTypes: true });

// Define the type of the request body of call to hide the reported message

export type ArchiveReportProps = {
	reportId: IReport['_id'];
};

const archiveReportPropsSchema = {
	type: 'object',
	properties: {
		reportId: {
			type: 'string',
		},
	},
	required: ['reportId'],
	additionalProperties: false,
};

export const isArchiveReportProps = ajv.compile<ArchiveReportProps>(archiveReportPropsSchema);
