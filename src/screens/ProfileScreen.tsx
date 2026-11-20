import { useAppDialog } from '../components/AppDialog';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AuraBackground } from '../components';
import { Colors, Typography } from '../theme';
// import {
//     getUser,
//     removeAuthData,
//     UserProfile,
// } from '../services/authStorage';
import { removeAuthData } from '../services/authStorage';
import { unregisterFcmToken } from '../services/notifications';

import {
    getMyProfile,
    getBranchDirectory,
    UserProfile,
} from '../services/profileApi';

interface ProfileScreenProps {
    onBackClick: () => void;
    onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    onBackClick,
    onLogout,
}) => {
  const showDialog = useAppDialog();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [branchName, setBranchName] = useState('Not available');
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [profileResponse, branches] = await Promise.all([
                    getMyProfile(),
                    getBranchDirectory(),
                ]);

                console.log('[PROFILE] My profile:', profileResponse);
                console.log('[PROFILE] Branch directory:', branches);

                // Extract the actual user object from Laravel's response.
                const profile = profileResponse.data;

                setUser(profile);

                // Find the matching branch using branchId and code.
                const branch = branches.find(
                    item => item.code === profile.branchId
                );

                setBranchName(branch?.name ?? 'Not available');

                console.log('[PROFILE] Resolved branch:', branch?.name);

            } catch (error) {
                console.error('[PROFILE] Failed to load:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const getDisplayValue = (value: unknown): string => {
        if (value === null || value === undefined || value === '') {
            return 'Not available';
        }

        if (typeof value === 'object') {
            const item = value as Record<string, unknown>;
            return String(item.name ?? item.branch_name ?? item.team_name ?? 'Not available');
        }

        return String(value);
    };

    const handleLogout = () => {
        showDialog(
            'Log out',
            'Are you sure you want to log out of CashRoute?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoggingOut(true);

                            await unregisterFcmToken();
                            await removeAuthData();

                            onLogout();
                        } catch (error) {
                            console.error('Logout error:', error);
                            setIsLoggingOut(false);

                            showDialog(
                                'Logout failed',
                                'Unable to clear your authentication data. Please try again.',
                            );
                        }
                    },
                },
            ],
        );
    };

    const displayName = getDisplayValue(user?.name);
    const initial = displayName !== 'Not available'
        ? displayName.charAt(0).toUpperCase()
        : 'U';

    const profileFields = [
        { label: 'Employee ID', value: user?.id },
        { label: 'Username', value: user?.username },
        { label: 'Email Address', value: user?.email },
        { label: 'Phone Number', value: user?.mobile },
        { label: 'Role', value: user?.role },
        { label: 'Branch', value: branchName },
        { label: 'Team ID', value: user?.teamId },
    ];

    return (
        <AuraBackground>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onBackClick}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Svg width={24} height={24} viewBox="0 0 24 24">
                            <Path
                                d="M15 18l-6-6 6-6"
                                stroke={Colors.White}
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>My Account</Text>

                    <View style={styles.headerSpacer} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={Colors.PrimaryGreen}
                        />
                        <Text style={styles.loadingText}>
                            Loading profile...
                        </Text>
                    </View>
                ) : !user ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.errorText}>
                            Unable to load your profile.
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Profile Avatar */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initial}</Text>
                            </View>

                            <Text style={styles.userName}>{displayName}</Text>

                            <Text style={styles.userRole}>
                                {getDisplayValue(user.role)}
                            </Text>

                            <Text style={styles.userSubtitle}>
                                CashRoute Delivery Team
                            </Text>
                        </View>

                        {/* Personal Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                ACCOUNT INFORMATION
                            </Text>

                            <View style={styles.infoCard}>
                                {profileFields.map((field, index) => (
                                    <View
                                        key={field.label}
                                        style={[
                                            styles.infoRow,
                                            index === profileFields.length - 1 &&
                                            styles.lastInfoRow,
                                        ]}
                                    >
                                        <Text style={styles.infoLabel}>
                                            {field.label}
                                        </Text>

                                        <Text style={styles.infoValue}>
                                            {getDisplayValue(field.value)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Logout */}
                        <TouchableOpacity
                            style={[
                                styles.logoutButton,
                                isLoggingOut && styles.logoutDisabled,
                            ]}
                            onPress={handleLogout}
                            disabled={isLoggingOut}
                            activeOpacity={0.8}
                        >
                            {isLoggingOut ? (
                                <ActivityIndicator color={Colors.AccentRed} />
                            ) : (
                                <>
                                    <Svg width={20} height={20} viewBox="0 0 24 24">
                                        <Path
                                            d="M10 17l5-5-5-5M15 12H3m9-7h6a2 2 0 012 2v10a2 2 0 01-2 2h-6"
                                            stroke={Colors.AccentRed}
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                        />
                                    </Svg>

                                    <Text style={styles.logoutText}>
                                        Log Out
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>
        </AuraBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 56,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Typography.titleLarge,
        color: Colors.White,
        fontWeight: '700',
    },
    headerSpacer: {
        width: 44,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.PurpleAccent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 34,
        color: Colors.White,
        fontWeight: '700',
    },
    userName: {
        ...Typography.headlineLarge,
        color: Colors.White,
        fontWeight: '700',
    },
    userRole: {
        ...Typography.titleMedium,
        color: Colors.PrimaryGreen,
        marginTop: 6,
    },
    userSubtitle: {
        ...Typography.bodySmall,
        color: Colors.TextSecondary,
        marginTop: 4,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        ...Typography.labelMedium,
        color: Colors.PrimaryGreen,
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        borderRadius: 18,
        paddingHorizontal: 18,
    },
    infoRow: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    lastInfoRow: {
        borderBottomWidth: 0,
    },
    infoLabel: {
        ...Typography.bodySmall,
        color: Colors.TextSecondary,
        marginBottom: 5,
    },
    infoValue: {
        ...Typography.bodyLarge,
        color: Colors.White,
        fontWeight: '600',
    },
    logoutButton: {
        height: 54,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,80,80,0.35)',
        backgroundColor: 'rgba(255,80,80,0.08)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    logoutDisabled: {
        opacity: 0.6,
    },
    logoutText: {
        ...Typography.titleMedium,
        color: Colors.AccentRed,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        ...Typography.bodyMedium,
        color: Colors.TextSecondary,
        marginTop: 12,
    },
    errorText: {
        ...Typography.bodyMedium,
        color: Colors.AccentRed,
    },
});