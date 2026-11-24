import { apiUpload } from './api';

type SubmitProofResponse = {
    message: string;
    trip?: unknown;
};

export async function submitProofOfDelivery(
    reference: string,
    photoUri: string,
    confirmedAmount: number,
) {
    const formData = new FormData();

    formData.append('photo', {
        uri: photoUri,
        name: 'proof-of-delivery.jpg',
        type: 'image/jpeg',
    } as any);

    formData.append('confirmed_amount', String(confirmedAmount));

    return apiUpload(
        `/trips/${encodeURIComponent(reference)}/proof`,
        formData,
    );
}