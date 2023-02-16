import { Option, OptionContent, OptionIcon } from '@rocket.chat/fuselage';
import { MessageComposerAction } from '@rocket.chat/ui-composer';
import { useTranslation, useSetting } from '@rocket.chat/ui-contexts';
import type { ChangeEvent } from 'react';
import React, { useRef } from 'react';

import type { ChatAPI } from '../../../../../../../../lib/chats/ChatAPI';
import { useChat } from '../../../../../../contexts/ChatContext';

type FileUploadActionProps = {
	collapsed?: boolean;
	isRecording: boolean;
	canSend: boolean;
	chatContext?: ChatAPI; // TODO: remove this when the composer is migrated to React
};

const FileUploadAction = ({ collapsed, chatContext, isRecording, canSend }: FileUploadActionProps) => {
	const t = useTranslation();
	const fileUploadEnabled = useSetting('FileUpload_Enabled');
	const fileInputRef = useRef<HTMLInputElement>(null);
	const chat = useChat() ?? chatContext;

	const handleUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const { mime } = await import('../../../../../../../../../app/utils/lib/mimeTypes');
		const filesToUpload = Array.from(e.target.files ?? []).map((file) => {
			Object.defineProperty(file, 'type', {
				value: mime.lookup(file.name),
			});
			return file;
		});

		chat?.flows.uploadFiles(filesToUpload);
	};

	const handleUpload = () => {
		fileInputRef.current?.click();

		// Simple hack for iOS aka codegueira
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			fileInputRef.current?.click();
		}
	};

	if (collapsed) {
		return (
			<Option
				{...((!fileUploadEnabled || isRecording) && { title: t('Not_Available') })}
				disabled={!fileUploadEnabled || isRecording}
				onClick={handleUpload}
			>
				<OptionIcon name='clip' />
				<OptionContent>{t('File')}</OptionContent>
			</Option>
		);
	}

	return (
		<>
			<MessageComposerAction
				data-qa-id='file-upload'
				icon='clip'
				disabled={!fileUploadEnabled || isRecording || !canSend}
				onClick={handleUpload}
				title={t('File')}
			/>
			<input ref={fileInputRef} type='file' onChange={handleUploadChange} multiple style={{ display: 'none' }} />
		</>
	);
};

export default FileUploadAction;